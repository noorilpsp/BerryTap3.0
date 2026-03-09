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
  /** Split item to a new work-group ticket. */
  handleSplitToNewTicket: (orderId: string, itemId: string) => Promise<void>;
  /** Move item back to main ticket (unsplit). */
  handleUnsplitToMain: (orderId: string, itemId: string) => Promise<void>;
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

function snapshotView(v: KdsView): KdsView {
  return structuredClone(v);
}

/**
 * Optimistic helper: apply patch immediately, run request, rollback on failure.
 * Same spirit as table page fireAndReconcile.
 */
async function kdsFireAndReconcile<T>(opts: {
  snapshot: KdsView;
  optimisticPatch: (prev: KdsView) => KdsView;
  patch: (updater: (prev: KdsView) => KdsView) => void;
  requestFn: () => Promise<T>;
  onSuccessPatch?: (result: T) => (prev: KdsView) => KdsView;
  onSuccess?: () => void;
  onFailure: () => void;
}): Promise<T | null> {
  opts.patch(opts.optimisticPatch);
  opts.onSuccess?.();
  try {
    const result = await opts.requestFn();
    if (opts.onSuccessPatch) {
      opts.patch(opts.onSuccessPatch(result));
    }
    return result;
  } catch {
    opts.patch(() => opts.snapshot);
    opts.onFailure();
    return null;
  }
}

/**
 * KDS mutation handlers: mark preparing, ready, served.
 * Uses optimistic updates, patches immediately, rollback on failure.
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

      const snapshot = snapshotView(view);
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => {
        const itemIdSet = new Set(itemsToUpdate.map((i) => i.id));
        const actionsForStatus = (s: typeof newStatus) => {
          switch (s) {
            case "preparing":
              return {
                canMarkPreparing: true,
                canMarkReady: false,
                canMarkServed: false,
              } as const;
            case "ready":
              return {
                canMarkPreparing: false,
                canMarkReady: false,
                canMarkServed: true,
              } as const;
            case "served":
              return {
                canMarkPreparing: false,
                canMarkReady: false,
                canMarkServed: false,
              } as const;
          }
        };
        return {
          ...prev,
          orderItems: prev.orderItems.map((it) =>
            itemIdSet.has(it.id) ? { ...it, status: newStatus } : it
          ),
          actions: {
            ...prev.actions,
            ...Object.fromEntries(
              itemsToUpdate.map((i) => [i.id, actionsForStatus(newStatus)])
            ),
          },
        };
      };

      const requestFn = async () => {
        const results = await Promise.all(
          itemsToUpdate.map(async (item) => {
            const res = await fetchPos(`/api/orders/${orderId}/items/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus, eventSource: "kds" }),
            });
            const p = await res.json().catch(() => ({}));
            if (!res.ok || !p?.ok) {
              throw new Error(p?.error?.message ?? "Request failed");
            }
            return p;
          })
        );
        return results;
      };

      const ok = await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to update item status");
          void refresh(true);
        },
      });

      if (
        ok != null &&
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

      const snapshot = snapshotView(view);
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => {
        const itemIdSet = new Set(itemsToUpdate.map((i) => i.id));
        return {
          ...prev,
          orderItems: prev.orderItems.map((it) =>
            itemIdSet.has(it.id) ? { ...it, status: "ready" as const } : it
          ),
          actions: {
            ...prev.actions,
            ...Object.fromEntries(
              itemsToUpdate.map((i) => [
                i.id,
                {
                  canMarkPreparing: false,
                  canMarkReady: false,
                  canMarkServed: true,
                } as const,
              ])
            ),
          },
        };
      };

      const requestFn = async () => {
        await Promise.all(
          itemsToUpdate.map(async (item) => {
            const res = await fetchPos(`/api/orders/${orderId}/items/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "ready",
                recall: true,
                eventSource: "kds",
              }),
            });
            const p = await res.json().catch(() => ({}));
            if (!res.ok || !p?.ok) {
              throw new Error(p?.error?.message ?? "Request failed");
            }
            return p;
          })
        );
      };

      const ok = await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to recall order");
          void refresh(true);
        },
      });
      return ok != null;
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

      const snapshot = snapshotView(view);
      const refiredAt = new Date().toISOString();
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
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
      });

      const requestFn = async () => {
        const res = await fetchPos(
          `/api/orders/${orderId}/items/${itemId}/refire`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason, eventSource: "kds" }),
          }
        );
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        return p;
      };

      const ok = await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to refire item");
          void refresh(true);
        },
      });
      return ok != null;
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleSplitToNewTicket = useCallback(
    async (orderId: string, itemId: string) => {
      if (!view) return;
      const item = view.orderItems.find(
        (i) => i.orderId === orderId && i.id === itemId && i.voidedAt == null
      );
      if (!item) return;

      const newGroup = "split" + Date.now().toString(36).slice(-6);
      const snapshot = snapshotView(view);
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
        ...prev,
        orderItems: prev.orderItems.map((it) =>
          it.id === itemId ? { ...it, prepGroup: newGroup } : it
        ),
      });

      const requestFn = async () => {
        const res = await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prepGroup: newGroup, eventSource: "kds" }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        return p;
      };

      await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to split item");
          void refresh(true);
        },
      });
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleUnsplitToMain = useCallback(
    async (orderId: string, itemId: string) => {
      if (!view) return;
      const item = view.orderItems.find(
        (i) => i.orderId === orderId && i.id === itemId && i.voidedAt == null
      );
      if (!item) return;

      const snapshot = snapshotView(view);
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
        ...prev,
        orderItems: prev.orderItems.map((it) =>
          it.id === itemId ? { ...it, prepGroup: null } : it
        ),
      });

      const requestFn = async () => {
        const res = await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prepGroup: null, eventSource: "kds" }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        return p;
      };

      await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to move item back");
          void refresh(true);
        },
      });
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

      const voidedAt = new Date().toISOString();
      const snapshot = snapshotView(view);
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
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
      });

      const requestFn = async () => {
        const res = await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Voided from KDS", eventSource: "kds" }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        const data = p?.data ?? p;
        return { data } as { data?: { voidedAt?: string } };
      };

      const onSuccessPatch = (result: { data?: { voidedAt?: string } }) => {
        const serverVoidedAt =
          typeof result?.data?.voidedAt === "string"
            ? result.data.voidedAt
            : voidedAt;
        return (prev: KdsView) => ({
          ...prev,
          orderItems: prev.orderItems.map((it) =>
            it.id === itemId ? { ...it, voidedAt: serverVoidedAt } : it
          ),
        });
      };

      await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccessPatch,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to void item");
          void refresh(true);
        },
      });
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleSnooze = useCallback(
    async (orderId: string, durationSeconds: number) => {
      const snapshot = view ? snapshotView(view) : null;
      const now = Date.now();
      const snoozedAt = new Date(now).toISOString();
      const snoozeUntil = new Date(
        now + durationSeconds * 1000
      ).toISOString();

      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                snoozedAt,
                snoozeUntil,
                isSnoozed: true,
                wasSnoozed: false,
              }
            : o
        ),
      });

      const requestFn = async () => {
        const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationSeconds }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        return p;
      };

      const onSuccessPatch = (result: {
        data?: { snoozedAt?: string; snoozeUntil?: string };
      }) => {
        const data = result?.data;
        const sa =
          typeof data?.snoozedAt === "string" ? data.snoozedAt : snoozedAt;
        const su =
          typeof data?.snoozeUntil === "string" ? data.snoozeUntil : snoozeUntil;
        return (prev: KdsView) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  snoozedAt: sa,
                  snoozeUntil: su,
                  isSnoozed: new Date(su).getTime() > Date.now(),
                  wasSnoozed: false,
                }
              : o
          ),
        });
      };

      if (!snapshot) {
        try {
          const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ durationSeconds }),
          });
          const p = await res.json().catch(() => ({}));
          if (!res.ok || !p?.ok) {
            toast.error("Failed to snooze order");
            void refresh(true);
            return;
          }
          patch(onSuccessPatch(p));
          onLocalAction?.(orderId);
        } catch {
          toast.error("Failed to snooze order");
          void refresh(true);
        }
        return;
      }

      await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccessPatch,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to snooze order");
          void refresh(true);
        },
      });
    },
    [view, patch, refresh, onLocalAction]
  );

  const handleWakeUp = useCallback(
    async (orderId: string) => {
      const snapshot = view ? snapshotView(view) : null;
      const optimisticPatch: (prev: KdsView) => KdsView = (prev) => ({
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
      });

      const requestFn = async () => {
        const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wake: true }),
        });
        const p = await res.json().catch(() => ({}));
        if (!res.ok || !p?.ok) {
          throw new Error(p?.error?.message ?? "Request failed");
        }
        return p;
      };

      if (!snapshot) {
        try {
          const res = await fetchPos(`/api/orders/${orderId}/snooze`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wake: true }),
          });
          const p = await res.json().catch(() => ({}));
          if (!res.ok || !p?.ok) {
            toast.error("Failed to wake order");
            void refresh(true);
            return;
          }
          patch(optimisticPatch);
          onLocalAction?.(orderId);
        } catch {
          toast.error("Failed to wake order");
          void refresh(true);
        }
        return;
      }

      await kdsFireAndReconcile({
        snapshot,
        optimisticPatch,
        patch,
        requestFn,
        onSuccess: () => onLocalAction?.(orderId),
        onFailure: () => {
          toast.error("Failed to wake order");
          void refresh(true);
        },
      });
    },
    [view, patch, refresh, onLocalAction]
  );

  return {
    handleMarkPreparing,
    handleMarkReady,
    handleMarkServed,
    handleVoidItem,
    handleRecallOrder,
    handleRefireItem,
    handleSplitToNewTicket,
    handleUnsplitToMain,
    handleSnooze,
    handleWakeUp,
  };
}
