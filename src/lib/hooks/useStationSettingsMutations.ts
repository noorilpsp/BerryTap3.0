"use client";

import { useCallback } from "react";
import { fetchPosEnvelope } from "@/lib/pos/fetchPos";
import { toast } from "sonner";
import type { StationSettingsView } from "@/lib/kds/stationSettingsView";
import type { StationSettingsStation } from "@/lib/kds/stationSettingsView";

export type UseStationSettingsMutationsOptions = {
  locationId: string | null;
  view: StationSettingsView | null;
  patch: (updater: (prev: StationSettingsView) => StationSettingsView) => void;
  refresh: (silent?: boolean) => Promise<boolean>;
};

export type UseStationSettingsMutationsResult = {
  createStation: (name: string) => Promise<StationSettingsStation | null>;
  updateStation: (id: string, updates: { name?: string; isActive?: boolean }) => Promise<boolean>;
  reorderStations: (stations: { id: string; displayOrder: number }[]) => Promise<boolean>;
};

export function useStationSettingsMutations({
  locationId,
  view,
  patch,
  refresh,
}: UseStationSettingsMutationsOptions): UseStationSettingsMutationsResult {
  const createStation = useCallback(
    async (name: string): Promise<StationSettingsStation | null> => {
      if (!locationId?.trim()) return null;
      const { res, payload } = await fetchPosEnvelope<{
        ok?: boolean;
        data?: StationSettingsStation;
        error?: { message?: string };
      }>("/api/kds/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId, name }),
      });
      if (!res.ok || !payload?.ok || !payload?.data) {
        toast.error(payload?.error?.message ?? "Failed to create station");
        void refresh(true);
        return null;
      }
      const station = payload.data;
      patch((prev) => ({
        ...prev,
        stations: [...prev.stations, station].sort((a, b) => a.displayOrder - b.displayOrder),
      }));
      return station;
    },
    [locationId, patch, refresh]
  );

  const updateStation = useCallback(
    async (id: string, updates: { name?: string; isActive?: boolean }): Promise<boolean> => {
      const { res, payload } = await fetchPosEnvelope<{
        ok?: boolean;
        data?: StationSettingsStation;
        error?: { message?: string };
      }>(`/api/kds/stations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok || !payload?.ok || !payload?.data) {
        toast.error(payload?.error?.message ?? "Failed to update station");
        void refresh(true);
        return false;
      }
      const updated = payload.data;
      patch((prev) => ({
        ...prev,
        stations: prev.stations.map((s) => (s.id === id ? updated : s)),
      }));
      return true;
    },
    [patch, refresh]
  );

  const reorderStations = useCallback(
    async (stations: { id: string; displayOrder: number }[]): Promise<boolean> => {
      if (!locationId?.trim()) return false;
      const { res, payload } = await fetchPosEnvelope<{
        ok?: boolean;
        error?: { message?: string };
      }>(
        `/api/kds/stations/reorder?locationId=${encodeURIComponent(locationId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stations }),
        }
      );
      if (!res.ok || !payload?.ok) {
        toast.error(payload?.error?.message ?? "Failed to reorder stations");
        void refresh(true);
        return false;
      }
      if (!view) return true;
      const byId = new Map(view.stations.map((s) => [s.id, s]));
      const orderMap = new Map(stations.map(({ id, displayOrder }) => [id, displayOrder]));
      const updated = view.stations
        .map((s) => {
          const newOrder = orderMap.get(s.id);
          return newOrder !== undefined ? { ...s, displayOrder: newOrder } : s;
        })
        .sort((a, b) => a.displayOrder - b.displayOrder);
      patch((prev) => ({ ...prev, stations: updated }));
      return true;
    },
    [locationId, view, patch, refresh]
  );

  return { createStation, updateStation, reorderStations };
}
