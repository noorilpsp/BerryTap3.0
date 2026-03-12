"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";

const KDS_POLL_INTERVAL_MS = 10_000;
const KDS_PATCH_COOLDOWN_MS = 2000;
import type { KdsView, KdsOrderItem } from "@/lib/kds/kdsView";
import { isKdsView } from "@/lib/kds/kdsView";

export type ItemsByStation = Record<string, KdsOrderItem[]>;

function groupItemsByStation(
  orderItems: KdsOrderItem[],
  orderIdToStation: Map<string, string | null>
): ItemsByStation {
  const byStation: ItemsByStation = {};
  for (const item of orderItems) {
    if (item.voidedAt != null) continue;
    const stationId = item.stationOverride ?? orderIdToStation.get(item.orderId) ?? "kitchen";
    const list = byStation[stationId] ?? [];
    list.push(item);
    byStation[stationId] = list;
  }
  return byStation;
}

export type UseKdsViewOptions = {
  /** Initial data from server render. Skips blocking initial fetch when present. */
  initialKdsView?: KdsView | null;
};

export type UseKdsViewResult = {
  view: KdsView | null;
  loading: boolean;
  /** Initial load or non-silent refresh failure. Triggers full-page error when no view. */
  error: string | null;
  /** Silent refresh/poll failure when view exists. Keep view, show stale banner. */
  staleError: string | null;
  refresh: (silent?: boolean) => Promise<boolean>;
  patch: (updater: (prev: KdsView) => KdsView) => void;
  itemsByStation: ItemsByStation;
  orderIdToStation: Map<string, string | null>;
};

export function useKdsView(
  locationId: string | null,
  options?: UseKdsViewOptions
): UseKdsViewResult {
  const { initialKdsView } = options ?? {};
  const [view, setView] = useState<KdsView | null>(initialKdsView ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleError, setStaleError] = useState<string | null>(null);
  const refreshInFlightRef = useRef(false);
  const viewRef = useRef<KdsView | null>(null);
  viewRef.current = view;

  const refresh = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!locationId) {
        setView(null);
        setStaleError(null);
        return false;
      }
      if (refreshInFlightRef.current) return false;
      refreshInFlightRef.current = true;
      if (!silent) {
        setLoading(true);
        setError(null);
        setStaleError(null);
      }
      try {
        const res = await fetch(
          `/api/kds/view?locationId=${encodeURIComponent(locationId)}`,
          { cache: "no-store" }
        );
        const payload = await res.json().catch(() => null);
        if (!res.ok || payload?.ok === false || !isKdsView(payload?.data)) {
          const message =
            payload?.error?.message ?? (typeof payload?.error === "string" ? payload.error : "Failed to load KDS view.");
          if (silent && viewRef.current) {
            setStaleError(message);
          } else {
            setError(message);
          }
          return false;
        }
        setView(payload.data);
        setError(null);
        setStaleError(null);
        return true;
      } catch {
        const message = "Network error. Failed to load KDS view.";
        if (silent && viewRef.current) {
          setStaleError(message);
        } else {
          setError(message);
        }
        return false;
      } finally {
        refreshInFlightRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [locationId]
  );

  const lastPatchAtRef = useRef(0);
  const patch = useCallback((updater: (prev: KdsView) => KdsView) => {
    setView((prev) => (prev ? updater(prev) : prev));
    lastPatchAtRef.current = Date.now();
  }, []);

  // Initial fetch: skip when we have server-provided initial data for this location
  const hasInitialFromServer =
    initialKdsView != null &&
    initialKdsView.location?.id != null &&
    locationId === initialKdsView.location.id;
  useEffect(() => {
    if (!locationId) return;
    if (hasInitialFromServer) return; // Use server data; polling/visibility will refresh
    refresh();
  }, [locationId, refresh, hasInitialFromServer]);

  // Refresh when page becomes visible (e.g. returning from another tab)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && locationId) void refresh(true);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [locationId, refresh]);

  // Poll while visible; pause when tab hidden
  useEffect(() => {
    if (!locationId) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastPatchAtRef.current < KDS_PATCH_COOLDOWN_MS) return;
      void refresh(true);
    }, KDS_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [locationId, refresh]);

  const orderIdToStation = useMemo(() => {
    if (!view) return new Map<string, string | null>();
    return new Map(view.orders.map((o) => [o.id, o.station]));
  }, [view]);

  const itemsByStation = useMemo(() => {
    if (!view) return {};
    return groupItemsByStation(view.orderItems, orderIdToStation);
  }, [view, orderIdToStation]);

  return {
    view,
    loading,
    error,
    staleError,
    refresh,
    patch,
    itemsByStation,
    orderIdToStation,
  };
}
