"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { FloorMapView } from "@/lib/floor-map/floorMapView";
import { isFloorMapView } from "@/lib/floor-map/floorMapView";
import { getFloorMapCache, setFloorMapCache } from "@/lib/view-cache";

export type UseFloorMapViewResult = {
  view: FloorMapView | null;
  loading: boolean;
  /** Initial load or non-silent refresh failure. Triggers full-page error when no view. */
  error: string | null;
  /** Silent refresh failure when view exists. Keep view, show stale banner. */
  staleError: string | null;
  refresh: (silent?: boolean) => Promise<boolean>;
  patch: (updater: (prev: FloorMapView) => FloorMapView) => void;
};

export function useFloorMapView(
  locationId: string | null,
  floorplanId?: string | null
): UseFloorMapViewResult {
  const [view, setView] = useState<FloorMapView | null>(
    () => (locationId ? getFloorMapCache(locationId, floorplanId ?? null) ?? null : null)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleError, setStaleError] = useState<string | null>(null);
  const refreshInFlightRef = useRef(false);
  const viewRef = useRef<FloorMapView | null>(null);
  viewRef.current = view;

  const refresh = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!locationId) {
        setView(null);
        setError(null);
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
        const params = new URLSearchParams({ locationId });
        if (floorplanId != null && floorplanId !== "") {
          params.set("floorplanId", floorplanId);
        }
        const res = await fetch(`/api/floor-map/view?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || payload?.ok === false || !isFloorMapView(payload?.data)) {
          const message =
            payload?.error?.message ??
            (typeof payload?.error === "string" ? payload.error : "Failed to load floor map view.");
          if (silent && viewRef.current) {
            setStaleError(message);
          } else {
            setError(message);
          }
          return false;
        }
        const data = payload.data;
        setView(data);
        setError(null);
        setStaleError(null);
        setFloorMapCache(locationId, floorplanId, data);
        return true;
      } catch {
        const message = "Network error. Failed to load floor map view.";
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
    [locationId, floorplanId]
  );

  const patch = useCallback((updater: (prev: FloorMapView) => FloorMapView) => {
    setView((prev) => (prev ? updater(prev) : prev));
  }, []);

  useEffect(() => {
    if (!locationId) {
      setView(null);
      setError(null);
      setStaleError(null);
      return;
    }
    const cached = getFloorMapCache(locationId, floorplanId ?? null);
    if (cached) {
      setView(cached);
      setLoading(false);
      setError(null);
      setStaleError(null);
      void refresh(true);
    } else {
      void refresh();
    }
  }, [refresh, locationId, floorplanId]);

  // Refresh when page becomes visible (e.g. returning from another tab)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && locationId) void refresh(true);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [locationId, refresh]);

  return {
    view,
    loading,
    error,
    staleError,
    refresh,
    patch,
  };
}
