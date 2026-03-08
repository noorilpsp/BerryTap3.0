/**
 * KDS aging timestamp helpers. Stage-appropriate timestamps for timers, sorting, queue.
 */

export type OrderWithAging = {
  id: string;
  createdAt: string;
  firedAt?: string | null;
  items: Array<{
    stationId?: string;
    sentToKitchenAt?: string | null;
    startedAt?: string | null;
    readyAt?: string | null;
  }>;
};

/** Arrival timestamp for queue numbering: when kitchen received the order. */
export function getArrivalTimestamp(order: OrderWithAging): string {
  return order.firedAt ?? order.createdAt;
}

/** Stage-appropriate age timestamp for display and sorting. */
export function getAgeTimestampForColumn(
  order: OrderWithAging,
  status: "pending" | "preparing" | "ready",
  currentStationId: string
): string {
  if (status === "pending") {
    return getArrivalTimestamp(order);
  }
  const stationItems = order.items.filter((i) => i.stationId === currentStationId);
  if (status === "preparing") {
    const timestamps: string[] = [];
    for (const i of stationItems) {
      if (i.startedAt) timestamps.push(i.startedAt);
      if (i.sentToKitchenAt) timestamps.push(i.sentToKitchenAt);
    }
    if (timestamps.length > 0) {
      return timestamps.reduce((a, b) => (a < b ? a : b));
    }
    return getArrivalTimestamp(order);
  }
  if (status === "ready") {
    const readyAts = stationItems
      .map((i) => i.readyAt)
      .filter((t): t is string => Boolean(t));
    if (readyAts.length > 0) {
      return readyAts.reduce((a, b) => (a < b ? a : b));
    }
    return order.createdAt;
  }
  return order.createdAt;
}
