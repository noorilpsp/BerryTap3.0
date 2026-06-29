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

/** Earliest kitchen-work start for station items (prep continues into READY). */
function getKitchenWorkTimestamp(
  stationItems: OrderWithAging["items"],
  order: OrderWithAging
): string {
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
  if (status === "preparing" || status === "ready") {
    // READY keeps the same kitchen clock as PREPARING (time since start/arrival),
    // not time since readyAt (which would reset when the ticket moves columns).
    return getKitchenWorkTimestamp(stationItems, order);
  }
  return order.createdAt;
}
