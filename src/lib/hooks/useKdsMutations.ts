"use client";

import { useCallback } from "react";
import { fetchPos } from "@/lib/pos/fetchPos";
import { toast } from "sonner";
import type { KdsView } from "@/lib/kds/kdsView";
import { resolveItemStation } from "@/lib/kds/resolveItemStation";

export type UseKdsMutationsOptions = {
  patch: (updater: (prev: KdsView) => KdsView) => void;
  refresh: (silent?: boolean) => Promise<boolean>;
  view: KdsView | null;
  /** When set, status updates only affect items for this station (per-station flow). */
  currentStationId?: string | null;
  /** Fallback station when item and order have no station. Must match page (e.g. view.stations[0]?.id ?? "kitchen"). */
  fallbackStationId: string;
  /** Called when an order is fully served for the station (after successful Bump). */
  onOrderServed?: (orderId: string) => void;
  /** Called when a local action patches the view (ready/void/etc). Used to suppress self-caused modification toasts. */
  onLocalAction?: (orderId: string) => void;
};

export type UseKdsMutationsResult = {
  handleMarkPreparing: (orderId: string, itemIds?: string[]) => Promise<void>;
  handleMarkReady: (orderId: string, itemIds?: string[]) => Promise<void>;
  handleMarkServed: (orderId: string, itemIds?: string[]) => Promise<void>;
  handleVoidItem: (orderId: string, itemId: string) => Promise<void>;
  /** Recall: un-serve station-scoped items (served → ready). */
  handleRecallOrder: (orderId: string, stationId: string) => Promise<boolean>;
  /** Refire (remake) an item: sets refiredAt, resets to pending. */
  handleRefireItem: (orderId: string, itemId: string, reason: string) => Promise<boolean>;
  /** Snooze order for durationSeconds. */
  handleSnooze: (orderId: string, durationSeconds: number) => Promise<void>;
  /** Wake order (clear snooze, set wasSnoozed). */
  handleWakeUp: (orderId: string) => Promise<void>;
};

const STATUS_TRANSITIONS: Record<string, "pending" | "preparing" | "ready" | "served"> = {
  preparing: "pending",
  ready: "preparing",
  served: "ready",
};

/**
 * KDS mutation handlers: mark preparing, ready, served.
 * Uses fetchPos, patches view on success, toasts and refresh(true) on failure.
 */
export function useKdsMutations({
  patch,
  refresh,
  view,
  currentStationId,
  fallbackStationId,
  onOrderServed,
  onLocalAction,
}: UseKdsMutationsOptions): UseKdsMutationsResult {
  const runStatusUpdate = useCallback(
    async (
      orderId: string,
      newStatus: "preparing" | "ready" | "served",
      itemIds?: string[]
    ) => {
      if (!view) return;
      const fromStatus = STATUS_TRANSITIONS[newStatus];
      const order = view.orders.find((o) => o.id === orderId);
      const itemStation = (i: { stationOverride: string | null }) =>
        resolveItemStation(i, order ?? { station: null }, fallbackStationId);

      // Only ever update items in the correct current status (fromStatus). This ensures READY
      // actions never advance pending or preparing items when we mean to bump only ready items.
      let itemsToUpdate = view.orderItems.filter(
        (i) => i.orderId === orderId && i.voidedAt == null && i.status === fromStatus
      );
      if (currentStationId) {
        itemsToUpdate = itemsToUpdate.filter((i) => itemStation(i) === currentStationId);
      }
      if (itemIds != null && itemIds.length > 0) {
        const idSet = new Set(itemIds);
        itemsToUpdate = itemsToUpdate.filter((i) => idSet.has(i.id));
      }
      if (itemsToUpdate.length === 0) return;

      let anyFailed = false;
      for (const item of itemsToUpdate) {
        try {
          const res = await fetchPos(`/api/orders/${orderId}/items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, eventSource: "kds" }),
          });
          const p = await res.json().catch(() => ({}));
          if (!res.ok || !p?.ok) {
            anyFailed = true;
            continue;
          }
          const data = p?.data ?? p;
          const itemId = data?.itemId ?? item.id;
          const status = data?.status ?? newStatus;
          patch((prev) => ({
            ...prev,
            orderItems: prev.orderItems.map((it) =>
              it.id === itemId ? { ...it, status: status as typeof it.status } : it
            ),
            actions: {
              ...prev.actions,
              [itemId]: {
                canMarkPreparing: status === "pending",
                canMarkReady: status === "preparing",
                canMarkServed: status === "ready",
              } as const,
            },
          }));
          onLocalAction?.(orderId);
        } catch {
          anyFailed = true;
        }
      }
      if (anyFailed) {
        toast.error("Failed to update item status");
        refresh(true);
      } else if (
        newStatus === "served" &&
        onOrderServed &&
        currentStationId &&
        itemsToUpdate.length > 0
      ) {
        onOrderServed(orderId);
      }
    },
    [view, patch, refresh, currentStationId, fallbackStationId, onOrderServed, onLocalAction]
  );

  const handleMarkPreparing = useCallback(
    (orderId: string, itemIds?: string[]) =>
      runStatusUpdate(orderId, "preparing", itemIds),
    [runStatusUpdate]
  );

  const handleMarkReady = useCallback(
    (orderId: string, itemIds?: string[]) =>
      runStatusUpdate(orderId, "ready", itemIds),
    [runStatusUpdate]
  );

  const handleMarkServed = useCallback(
    (orderId: string, itemIds?: string[]) =>
      runStatusUpdate(orderId, "served", itemIds),
    [runStatusUpdate]
  );

  const handleRecallOrder = useCallback(
    async (orderId: string, stationId: string): Promise<boolean> => {
      if (!view) return false;
      const order = view.orders.find((o) => o.id === orderId);
      const itemStation = (i: { stationOverride: string | null }) =>
        resolveItemStation(i, order ?? { station: null }, fallbackStationId);
      const itemsToUpdate = view.orderItems.filter(
        (i) =>
          i.orderId === orderId &&
          i.voidedAt == null &&
          i.status === "served" &&
          itemStation(i) === stationId
      );
      if (itemsToUpdate.length === 0) return true;

      let anyFailed = false;
      for (const item of itemsToUpdate) {
        try {
          const res = await fetchPos(`/api/orders/${orderId}/items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ready", recall: true, eventSource: "kds" }),
          });
          const p = await res.json().catch(() => ({}));
          if (!res.ok || !p?.ok) {
            anyFailed = true;
            continue;
          }
          const data = p?.data ?? p;
          const itemId = data?.itemId ?? item.id;
          patch((prev) => ({
            ...prev,
            orderItems: prev.orderItems.map((it) =>
              it.id === itemId ? { ...it, status: "ready" as const } : it
            ),
            actions: {
              ...prev.actions,
              [itemId]: {
                canMarkPreparing: false,
                canMarkReady: false,
                canMarkServed: true,
              } as const,
            },
          }));
          onLocalAction?.(orderId);
        } catch {
          anyFailed = true;
        }
      }
      if (anyFailed) {
        toast.error("Failed to recall order");
        refresh(true);
        return false;
      }
      return true;
    },
    [view, patch, refresh, fallbackStationId, onLocalAction]
  );

  const handleRefireItem = useCallback(
    async (orderId: string, itemId: string, reason: string): Promise<boolean> => {
      if (!view) return false;
      const item = view.orderItems.find(
        (i) => i.orderId === orderId && i.id === itemId && i.voidedAt == null
      );
      if (!item) return false;

      try {
        const res = await fetchPos(`/api/orders/${orderId}/items/${itemId}/refire`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, eventSource: "kds" }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          toast.error("Failed to refire item");
          refresh(true);
          return false;
        }
        const refiredAt = new Date().toISOString();
        patch((prev) => ({
          ...prev,
          orderItems: prev.orderItems.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  status: "pending" as const,
                  startedAt: null,
                  readyAt: null,
                  servedAt: null,
                  refiredAt,
                }
              : it
          ),
          actions: {
            ...prev.actions,
            [itemId]: {
              canMarkPreparing: true,
              canMarkReady: false,
              canMarkServed: false,
            } as const,
          },
        }));
        onLocalAction?.(orderId);
        return true;
      } catch {
        toast.error("Failed to refire item");
        refresh(true);
        return false;
      }
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleVoidItem = useCallback(
    async (orderId: string, itemId: string) => {
      if (!view) return;
      const item = view.orderItems.find(
        (i) => i.orderId === orderId && i.id === itemId && i.voidedAt == null
      );
      if (!item) return;

      try {
        const res = await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Voided from KDS", eventSource: "kds" }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          toast.error("Failed to void item");
          refresh(true);
          return;
        }
        const data = p?.data ?? p;
        const voidedAt = typeof data?.voidedAt === "string" ? data.voidedAt : new Date().toISOString();
        patch((prev) => ({
          ...prev,
          orderItems: prev.orderItems.map((it) =>
            it.id === itemId ? { ...it, voidedAt } : it
          ),
          actions: {
            ...prev.actions,
            [itemId]: {
              canMarkPreparing: false,
              canMarkReady: false,
              canMarkServed: false,
            } as const,
          },
        }));
        onLocalAction?.(orderId);
      } catch {
        toast.error("Failed to void item");
        refresh(true);
      }
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleSnooze = useCallback(
    async (orderId: string, durationSeconds: number) => {
      try {
        const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationSeconds }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          toast.error("Failed to snooze order");
          refresh(true);
          return;
        }
        const data = p?.data ?? p;
        const snoozedAt = data?.snoozedAt;
        const snoozeUntil = data?.snoozeUntil;
        if (typeof snoozedAt === "string" && typeof snoozeUntil === "string") {
          const now = Date.now();
          patch((prev) => ({
            ...prev,
            orders: prev.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    snoozedAt,
                    snoozeUntil,
                    isSnoozed: new Date(snoozeUntil).getTime() > now,
                    wasSnoozed: false,
                  }
                : o
            ),
          }));
          onLocalAction?.(orderId);
        } else {
          refresh(true);
        }
      } catch {
        toast.error("Failed to snooze order");
        refresh(true);
      }
    },
    [patch, refresh, onLocalAction]
  );

  const handleWakeUp = useCallback(
    async (orderId: string) => {
      try {
        const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wake: true }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          toast.error("Failed to wake order");
          refresh(true);
          return;
        }
        patch((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  snoozedAt: null,
                  snoozeUntil: null,
                  isSnoozed: false,
                  wasSnoozed: true,
                }
              : o
          ),
        }));
        onLocalAction?.(orderId);
      } catch {
        toast.error("Failed to wake order");
        refresh(true);
      }
    },
    [patch, refresh, onLocalAction]
  );

  return {
    handleMarkPreparing,
    handleMarkReady,
    handleMarkServed,
    handleVoidItem,
    handleRecallOrder,
    handleRefireItem,
    handleSnooze,
    handleWakeUp,
  };
}
