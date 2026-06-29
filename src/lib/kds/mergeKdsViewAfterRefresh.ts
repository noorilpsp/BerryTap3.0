import type { KdsOrderItem, KdsOrderItemStatus, KdsView } from "@/lib/kds/kdsView";

const STATUS_RANK: Record<KdsOrderItemStatus, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
  served: 3,
};

function actionsForStatus(status: KdsOrderItemStatus) {
  switch (status) {
    case "pending":
      return {
        canMarkPreparing: true,
        canMarkReady: false,
        canMarkServed: false,
      } as const;
    case "preparing":
      return {
        canMarkPreparing: false,
        canMarkReady: true,
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
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * When a refresh returns while local optimistic updates are ahead of the server,
 * keep the more-advanced item statuses so tickets do not snap back a column.
 */
export function mergeKdsViewAfterRefresh(local: KdsView, remote: KdsView): KdsView {
  const remoteItemsById = new Map(remote.orderItems.map((item) => [item.id, item]));
  const localItemsById = new Map(local.orderItems.map((item) => [item.id, item]));
  const mergedItemIds = new Set<string>();
  const orderItems: KdsOrderItem[] = [];

  for (const localItem of local.orderItems) {
    const remoteItem = remoteItemsById.get(localItem.id);
    if (!remoteItem) {
      orderItems.push(localItem);
      mergedItemIds.add(localItem.id);
      continue;
    }

    const localRank = STATUS_RANK[localItem.status];
    const remoteRank = STATUS_RANK[remoteItem.status];
    if (localRank > remoteRank) {
      orderItems.push({
        ...remoteItem,
        status: localItem.status,
        startedAt: localItem.startedAt ?? remoteItem.startedAt,
        readyAt: localItem.readyAt ?? remoteItem.readyAt,
        servedAt: localItem.servedAt ?? remoteItem.servedAt,
      });
    } else {
      orderItems.push(remoteItem);
    }
    mergedItemIds.add(localItem.id);
  }

  for (const remoteItem of remote.orderItems) {
    if (!mergedItemIds.has(remoteItem.id)) {
      orderItems.push(remoteItem);
    }
  }

  const actions = { ...remote.actions };
  for (const item of orderItems) {
    const localItem = localItemsById.get(item.id);
    const remoteItem = remoteItemsById.get(item.id);
    if (!localItem || !remoteItem) continue;
    if (STATUS_RANK[localItem.status] > STATUS_RANK[remoteItem.status]) {
      actions[item.id] = actionsForStatus(localItem.status);
    }
  }

  return {
    ...remote,
    orderItems,
    actions,
  };
}
