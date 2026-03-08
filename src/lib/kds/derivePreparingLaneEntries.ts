/**
 * Lane-entry derivation for KDS PREPARING column.
 * Splits orders by substation/lane; one order may produce multiple lane entries.
 */

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export type PreparingLaneId = "grill" | "fryer" | "cold_prep" | "unassigned";

const PREPARING_LANES: readonly PreparingLaneId[] = [
  "grill",
  "fryer",
  "cold_prep",
  "unassigned",
];

export interface LaneEntryItem {
  id: string;
  name: string;
  variant: string | null;
  quantity: number;
  customizations: string[];
  stationId?: string;
  substation?: string | null;
  status?: "pending" | "preparing" | "ready" | "served";
  sentToKitchenAt?: string | null;
  startedAt?: string | null;
  voidedAt?: string | null;
  refiredAt?: string | null;
}

export interface LaneEntry {
  orderId: string;
  lane: PreparingLaneId;
  items: LaneEntryItem[];
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  createdAt: string;
  /** Lane-appropriate: earliest startedAt or sentToKitchenAt of lane items. Fallback: order createdAt. */
  ageTimestamp: string;
  stationStatuses: Record<string, OrderStatus>;
  specialInstructions?: string;
  isPriority?: boolean;
  stationStatusesFull?: Record<string, OrderStatus>;
  isRemake?: boolean;
  isFullRemake?: boolean;
  remakeReason?: string;
  originalOrderId?: string;
  isRecalled?: boolean;
  recalledAt?: string;
  isModified?: boolean;
  modifiedAt?: string;
  isSnoozed?: boolean;
  snoozedAt?: string;
  snoozeUntil?: string;
  snoozeDurationSeconds?: number;
  wasSnoozed?: boolean;
}

interface InputOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  tableNumber: string | null;
  customerName: string | null;
  createdAt: string;
  firedAt?: string | null;
  items: LaneEntryItem[];
  stationStatuses?: Record<string, OrderStatus>;
  specialInstructions?: string;
  isPriority?: boolean;
  isRemake?: boolean;
  isFullRemake?: boolean;
  remakeReason?: string;
  originalOrderId?: string;
  isRecalled?: boolean;
  recalledAt?: string;
  isModified?: boolean;
  modifiedAt?: string;
  isSnoozed?: boolean;
  snoozedAt?: string;
  snoozeUntil?: string;
  snoozeDurationSeconds?: number;
  wasSnoozed?: boolean;
}

/**
 * Lane/station aggregate status. Mixed state (pending + ready/preparing) -> "preparing".
 */
function statusFromItems(items: { status?: string }[]): OrderStatus {
  if (items.length === 0) return "pending";
  const hasPending = items.some((i) => i.status === "pending");
  const hasPreparing = items.some((i) => i.status === "preparing");
  const hasReady = items.some((i) => i.status === "ready");
  if (hasPending && !hasPreparing && !hasReady) return "pending";
  if (hasPending && (hasReady || hasPreparing)) return "preparing";
  if (hasPreparing) return "preparing";
  if (hasReady) return "ready";
  return "served";
}

/**
 * Derives lane entries from preparing orders. Each (order, lane) with at least one
 * pending or preparing item yields one entry. Items in entry are only those for that lane.
 */
export function derivePreparingLaneEntries(
  orders: InputOrder[],
  activeStationId: string
): LaneEntry[] {
  const entries: LaneEntry[] = [];
  for (const order of orders) {
    const stationItems = order.items.filter((i) => i.stationId === activeStationId);
    if (stationItems.length === 0) continue;
    const byLane = new Map<PreparingLaneId, LaneEntryItem[]>();
    for (const item of stationItems) {
      const lane: PreparingLaneId =
        item.substation && PREPARING_LANES.includes(item.substation as PreparingLaneId)
          ? (item.substation as PreparingLaneId)
          : "unassigned";
      const list = byLane.get(lane) ?? [];
      list.push(item);
      byLane.set(lane, list);
    }
    for (const lane of PREPARING_LANES) {
      const laneItems = byLane.get(lane) ?? [];
      const activeItems = laneItems.filter((i) => i.voidedAt == null);
      const hasWork = activeItems.some(
        (i) => i.status === "pending" || i.status === "preparing"
      );
      if (!hasWork) continue;
      const laneStatus = statusFromItems(activeItems);
      if (laneStatus === "ready") continue;
      const timestamps: string[] = [];
      for (const i of activeItems) {
        if (i.startedAt) timestamps.push(i.startedAt);
        if (i.sentToKitchenAt) timestamps.push(i.sentToKitchenAt);
      }
      const ageTimestamp =
        timestamps.length > 0
          ? timestamps.reduce((a, b) => (a < b ? a : b))
          : order.firedAt ?? order.createdAt;
      entries.push({
        orderId: order.id,
        lane,
        items: laneItems,
        orderNumber: order.orderNumber,
        orderType: order.orderType as "dine_in" | "pickup",
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        createdAt: order.createdAt,
        ageTimestamp,
        stationStatuses: { [activeStationId]: laneStatus },
        stationStatusesFull: order.stationStatuses,
        specialInstructions: order.specialInstructions,
        isPriority: order.isPriority,
        isRemake: order.isRemake,
        isFullRemake: order.isFullRemake,
        remakeReason: order.remakeReason,
        originalOrderId: order.originalOrderId,
        isRecalled: order.isRecalled,
        recalledAt: order.recalledAt,
        isModified: order.isModified,
        modifiedAt: order.modifiedAt,
        isSnoozed: order.isSnoozed,
        snoozedAt: order.snoozedAt,
        snoozeUntil: order.snoozeUntil,
        snoozeDurationSeconds: order.snoozeDurationSeconds,
        wasSnoozed: order.wasSnoozed,
      });
    }
  }
  return entries;
}

/** Substation progress for a merged READY ticket. */
export interface ReadySubstationSummary {
  readyLanes: PreparingLaneId[];
  waitingLanes: PreparingLaneId[];
  allReady: boolean;
}

/**
 * Derives substation summary for an order at the active station.
 * For kitchen: which lanes are ready vs waiting. For other stations: no lanes.
 */
export function deriveReadySubstationSummary(
  order: InputOrder,
  activeStationId: string
): ReadySubstationSummary | null {
  if (activeStationId !== "kitchen") return null;
  const stationItems = order.items.filter((i) => i.stationId === activeStationId);
  const activeItems = stationItems.filter((i) => i.voidedAt == null);
  if (activeItems.length === 0) return null;

  const byLane = new Map<PreparingLaneId, LaneEntryItem[]>();
  for (const item of activeItems) {
    const lane: PreparingLaneId =
      item.substation && PREPARING_LANES.includes(item.substation as PreparingLaneId)
        ? (item.substation as PreparingLaneId)
        : "unassigned";
    const list = byLane.get(lane) ?? [];
    list.push(item);
    byLane.set(lane, list);
  }

  const readyLanes: PreparingLaneId[] = [];
  const waitingLanes: PreparingLaneId[] = [];
  for (const lane of PREPARING_LANES) {
    const laneItems = byLane.get(lane) ?? [];
    if (laneItems.length === 0) continue;
    const laneStatus = statusFromItems(laneItems);
    if (laneStatus === "ready") {
      readyLanes.push(lane);
    } else {
      waitingLanes.push(lane);
    }
  }
  return {
    readyLanes,
    waitingLanes,
    allReady: waitingLanes.length === 0,
  };
}

/**
 * Orders that belong in the READY column for the active station.
 * Kitchen: orders with at least one substation ready (merged ticket with summary).
 * Other stations: orders with station status ready.
 */
export function getOrdersForReadyColumn(
  orders: InputOrder[],
  activeStationId: string
): InputOrder[] {
  if (activeStationId !== "kitchen") {
    return orders.filter(
      (o) => o.stationStatuses?.[activeStationId] === "ready"
    );
  }
  return orders.filter((order) => {
    const stationItems = order.items.filter((i) => i.stationId === activeStationId && i.voidedAt == null);
    if (stationItems.length === 0) return false;
    const summary = deriveReadySubstationSummary(order, activeStationId);
    return summary != null && summary.readyLanes.length > 0;
  });
}
