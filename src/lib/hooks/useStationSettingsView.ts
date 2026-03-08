"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { StationSettingsView } from "@/lib/kds/stationSettingsView";
import { isStationSettingsView } from "@/lib/kds/stationSettingsView";

export type UseStationSettingsViewResult = {
  view: StationSettingsView | null;
  loading: boolean;
  error: string | null;
  refresh: (silent?: boolean) => Promise<boolean>;
  patch: (updater: (prev: StationSettingsView) => StationSettingsView) => void;
};

export function useStationSettingsView(locationId: string | null): UseStationSettingsViewResult {
  const [view, setView] = useState<StationSettingsView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshInFlightRef = useRef(false);

  const refresh = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!locationId) {
        setView(null);
        return false;
      }
      if (refreshInFlightRef.current) return false;
      refreshInFlightRef.current = true;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(
          `/api/kds/stations?locationId=${encodeURIComponent(locationId)}`,
          { cache: "no-store" }
        );
        const payload = await res.json().catch(() => null);
        if (!res.ok || payload?.ok === false || !isStationSettingsView(payload?.data)) {
          const msg =
            payload?.error?.message ??
            (typeof payload?.error === "string" ? payload.error : "Failed to load station settings.");
          setError(msg);
          return false;
        }
        setView(payload.data);
        if (!silent) setError(null);
        return true;
      } catch {
        setError("Network error. Failed to load station settings.");
        return false;
      } finally {
        refreshInFlightRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [locationId]
  );

  const patch = useCallback((updater: (prev: StationSettingsView) => StationSettingsView) => {
    setView((prev) => (prev ? updater(prev) : prev));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { view, loading, error, refresh, patch };
}
