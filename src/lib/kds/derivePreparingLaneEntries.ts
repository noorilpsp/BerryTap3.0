/**
 * Lane-entry derivation for KDS PREPARING column.
 * Splits orders by substation/lane; one order may produce multiple lane entries.
 */

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

/** Legacy fixed lanes; used when no configured substations. */
export type PreparingLaneId = "grill" | "fryer" | "cold_prep" | "unassigned";

const DEFAULT_PREPARING_LANES: readonly string[] = [
  "grill",
  "fryer",
  "cold_prep",
  "unassigned",
];

const MAIN = "main";

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
  prepGroup?: string | null;
}

export interface LaneEntry {
  orderId: string;
  /** Work group (main or split). */
  prepGroup: string;
  /** Lane key (e.g. grill, fryer, unassigned). */
  lane: string;
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
 * Derives lane entries from preparing orders. Only work-groups whose group-level status
 * is "preparing" (or beyond) are included; purely pending groups stay in NEW only.
 * Each (order, prepGroup, lane) yields one entry. Items in entry are only those for that lane.
 * @param preparingLaneKeys - Configured lane keys (e.g. from location_substations). Must include "unassigned" or it is appended.
 */
export function derivePreparingLaneEntries(
  orders: InputOrder[],
  activeStationId: string,
  preparingLaneKeys?: string[]
): LaneEntry[] {
  const laneKeys =
    preparingLaneKeys && preparingLaneKeys.length > 0
      ? preparingLaneKeys.includes("unassigned")
        ? preparingLaneKeys
        : [...preparingLaneKeys, "unassigned"]
      : [...DEFAULT_PREPARING_LANES];
  const validKeys = new Set(laneKeys);
  const entries: LaneEntry[] = [];
  for (const order of orders) {
    const stationItems = order.items.filter((i) => i.stationId === activeStationId);
    if (stationItems.length === 0) continue;

    const byGroup = new Map<string, LaneEntryItem[]>();
    for (const item of stationItems) {
      const group = item.prepGroup && String(item.prepGroup).trim() ? item.prepGroup : MAIN;
      const list = byGroup.get(group) ?? [];
      list.push(item);
      byGroup.set(group, list);
    }

    for (const [prepGroup, groupItems] of byGroup) {
      // Only emit PREPARING entries for work-groups whose group-level status is preparing (or beyond).
      // Skip purely pending groups so they stay in NEW only (mutual exclusivity).
      const groupStatus = statusFromItems(groupItems);
      if (groupStatus === "pending") continue;

      const byLane = new Map<string, LaneEntryItem[]>();
      for (const item of groupItems) {
        const lane =
          item.substation && validKeys.has(item.substation) ? item.substation : "unassigned";
        const list = byLane.get(lane) ?? [];
        list.push(item);
        byLane.set(lane, list);
      }
      for (const lane of laneKeys) {
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
          prepGroup,
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
  }
  return entries;
}

/** Substation progress for a merged READY ticket. */
export interface ReadySubstationSummary {
  readyLanes: string[];
  waitingLanes: string[];
  allReady: boolean;
}

/**
 * Derives substation summary for an order at the active station.
 * Partitions by (prepGroup, lane) so split work-groups are considered separately:
 * - A lane is "ready" if ANY work-group has that lane fully ready.
 * - A lane is "waiting" if ANY work-group still has work in that lane.
 * Returns null when station has no configured lanes.
 */
export function deriveReadySubstationSummary(
  order: InputOrder,
  activeStationId: string,
  preparingLaneKeys?: string[]
): ReadySubstationSummary | null {
  if (!preparingLaneKeys || preparingLaneKeys.length === 0) return null;

  const laneKeys = preparingLaneKeys.includes("unassigned")
    ? preparingLaneKeys
    : [...preparingLaneKeys, "unassigned"];

  const stationItems = order.items.filter((i) => i.stationId === activeStationId);
  const activeItems = stationItems.filter((i) => i.voidedAt == null);
  if (activeItems.length === 0) return null;

  const validKeys = new Set(laneKeys);
  const byGroupAndLane = new Map<string, LaneEntryItem[]>();
  for (const item of activeItems) {
    const group = item.prepGroup && String(item.prepGroup).trim() ? item.prepGroup : MAIN;
    const lane =
      item.substation && validKeys.has(item.substation) ? item.substation : "unassigned";
    const key = `${group}\0${lane}`;
    const list = byGroupAndLane.get(key) ?? [];
    list.push(item);
    byGroupAndLane.set(key, list);
  }

  const laneHasReady = new Set<string>();
  const laneHasWaiting = new Set<string>();
  for (const key of byGroupAndLane.keys()) {
    const lane = key.split("\0")[1];
    const items = byGroupAndLane.get(key)!;
    const laneStatus = statusFromItems(items);
    if (laneStatus === "ready") {
      laneHasReady.add(lane);
    } else {
      laneHasWaiting.add(lane);
    }
  }

  const readyLanes = laneKeys.filter((l) => laneHasReady.has(l));
  const waitingLanes = laneKeys.filter((l) => laneHasWaiting.has(l));
  const allReady = laneHasWaiting.size === 0;

  return {
    readyLanes,
    waitingLanes,
    allReady,
  };
}

/**
 * Returns true if any work-group at the station has all its items ready.
 * Used for READY inclusion when the station has no lane config.
 */
function hasAnyWorkGroupReadyAtStation(
  order: InputOrder,
  activeStationId: string
): boolean {
  const stationItems = order.items.filter(
    (i) => i.stationId === activeStationId && i.voidedAt == null
  );
  if (stationItems.length === 0) return false;
  const byGroup = new Map<string, LaneEntryItem[]>();
  for (const item of stationItems) {
    const group = item.prepGroup && String(item.prepGroup).trim() ? item.prepGroup : MAIN;
    const list = byGroup.get(group) ?? [];
    list.push(item);
    byGroup.set(group, list);
  }
  for (const groupItems of byGroup.values()) {
    if (statusFromItems(groupItems) === "ready") return true;
  }
  return false;
}

/**
 * Orders that belong in the READY column for the active station.
 * READY remains merged by order (one ticket per order).
 * Inclusion: show order as soon as ANY split work-group is ready at the station.
 * When station has lanes: uses (prepGroup, lane) partitioning; includes when any (group, lane) is ready.
 * When no lanes: includes when any work-group at the station is ready.
 */
export function getOrdersForReadyColumn(
  orders: InputOrder[],
  activeStationId: string,
  preparingLaneKeys?: string[]
): InputOrder[] {
  if (!preparingLaneKeys || preparingLaneKeys.length === 0) {
    return orders.filter((o) => hasAnyWorkGroupReadyAtStation(o, activeStationId));
  }
  return orders.filter((order) => {
    const stationItems = order.items.filter(
      (i) => i.stationId === activeStationId && i.voidedAt == null
    );
    if (stationItems.length === 0) return false;
    const summary = deriveReadySubstationSummary(
      order,
      activeStationId,
      preparingLaneKeys
    );
    return summary != null && summary.readyLanes.length > 0;
  });
}
