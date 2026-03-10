"use client";

import { useCallback } from "react";
import { fetchPos } from "@/lib/pos/fetchPos";
import { toast } from "sonner";
import type { FloorMapView } from "@/lib/floor-map/floorMapView";

export type UseFloorMapMutationsOptions = {
  patch: (updater: (prev: FloorMapView) => FloorMapView) => void;
  refresh: (silent?: boolean) => Promise<boolean>;
  view: FloorMapView | null;
};

/**
 * Floor Map mutation helper: optimistic patch → API → refresh on success, rollback on failure.
 * Same spirit as table page fireAndReconcile and KDS kdsFireAndReconcile.
 */
export async function mutateThenRefresh<T>(opts: {
  label: string;
  patch: (updater: (prev: FloorMapView) => FloorMapView) => void;
  refresh: (silent?: boolean) => Promise<boolean>;
  view: FloorMapView | null;
  optimisticPatch?: (prev: FloorMapView) => FloorMapView;
  requestFn: () => Promise<T>;
  onSuccess?: (result: T) => void;
}): Promise<T | null> {
  const snapshot = opts.view ? structuredClone(opts.view) : null;

  if (opts.optimisticPatch && opts.view) {
    opts.patch(opts.optimisticPatch);
  }

  try {
    const result = await opts.requestFn();
    await opts.refresh(true);
    opts.onSuccess?.(result);
    return result;
  } catch (error) {
    if (snapshot && opts.optimisticPatch) {
      opts.patch(() => snapshot);
    }
    const message =
      error instanceof Error ? error.message : "Request failed. Please try again.";
    toast.error(message);
    return null;
  }
}

/**
 * Hook that returns seat party mutation using mutateThenRefresh.
 */
export function useFloorMapMutations({
  patch,
  refresh,
  view,
}: UseFloorMapMutationsOptions) {
  const seatParty = useCallback(
    async (params: {
      tableId: string;
      partySize: number;
      locationId: string;
      serverId: string;
    }): Promise<boolean> => {
      const { tableId, partySize, locationId, serverId } = params;
      if (!view) return false;

      const optimisticPatch = (prev: FloorMapView): FloorMapView => {
        const tables = prev.tables.map((t) =>
          t.id.toLowerCase() === tableId.toLowerCase()
            ? {
                ...t,
                status: "active" as const,
                guests: partySize,
                stage: "drinks" as const,
                serverId,
                serverName: prev.currentServer?.name ?? null,
                seatedAt: new Date().toISOString(),
              }
            : t
        );
        const freeCount = tables.filter((t) => t.status === "free").length;
        const activeCount = tables.filter((t) => t.status === "active").length;
        return {
          ...prev,
          tables,
          statusCounts: {
            ...prev.statusCounts,
            free: freeCount,
            active: activeCount,
          },
        };
      };

      const result = await mutateThenRefresh({
        label: "Seat party",
        patch,
        refresh,
        view,
        optimisticPatch,
        requestFn: async () => {
          const res = await fetchPos("/api/sessions/ensure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tableUuid: tableId,
              locationId,
              guestCount: partySize,
              eventSource: "floor_map",
            }),
          });
          const payload = await res.json().catch(() => ({}));
          if (!res.ok || payload?.ok !== true) {
            const msg =
              (payload?.error && typeof payload.error === "object" && payload.error.message) ||
              (typeof payload?.error === "string" ? payload.error : null);
            throw new Error(msg ?? "Failed to create session");
          }
          const data = payload.data as { sessionId?: string };
          if (data?.sessionId) {
            const evRes = await fetchPos(
              `/api/sessions/${encodeURIComponent(data.sessionId)}/events`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "guest_seated",
                  payload: { guestCount: partySize },
                  eventSource: "floor_map",
                }),
              }
            );
            const evPayload = await evRes.json().catch(() => ({}));
            if (!evRes.ok || evPayload?.ok !== true) {
              // Session exists; event failure is non-fatal
              console.warn("[FloorMap] guest_seated event failed:", evPayload?.error?.message);
            }
          }
          return data;
        },
      });

      return result != null;
    },
    [view, patch, refresh]
  );

  return { seatParty };
}
