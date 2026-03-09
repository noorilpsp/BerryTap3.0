/**
 * Derives NEW column tickets per work group.
 * Partitions order items by prepGroup; one ticket per (order, prepGroup) that has pending items at the station.
 */

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export interface WorkGroupItem {
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
  readyAt?: string | null;
  voidedAt?: string | null;
  refiredAt?: string | null;
  prepGroup?: string | null;
}

export interface WorkGroupEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  createdAt: string;
  firedAt?: string | null;
  items: WorkGroupItem[];
  status: OrderStatus;
  stationStatuses: Record<string, OrderStatus>;
  /** Order-level station statuses for waiting-on (remains order-level per plan). */
  stationStatusesFull?: Record<string, OrderStatus>;
  prepGroup: string;
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

interface InputOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  tableNumber: string | null;
  customerName: string | null;
  createdAt: string;
  firedAt?: string | null;
  items: WorkGroupItem[];
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

const MAIN = "main";

/**
 * Partitions items by work group: (orderId, prepGroup ?? "main").
 * Derives one ticket per work group where stationStatuses[activeStationId] === "pending".
 */
export function deriveNewWorkGroupEntries(
  orders: InputOrder[],
  activeStationId: string
): WorkGroupEntry[] {
  const entries: WorkGroupEntry[] = [];

  for (const order of orders) {
    const rawItems = order.items.filter((i) => i.voidedAt == null);
    if (rawItems.length === 0) continue;

    const byGroup = new Map<string, WorkGroupItem[]>();
    for (const item of rawItems) {
      const group = item.prepGroup && item.prepGroup.trim() ? item.prepGroup : MAIN;
      const list = byGroup.get(group) ?? [];
      list.push(item);
      byGroup.set(group, list);
    }

    for (const [prepGroup, groupItems] of byGroup) {
      const stationItems = groupItems.filter((i) => i.stationId === activeStationId);
      if (stationItems.length === 0) continue;

      const groupStatus = statusFromItems(stationItems);
      if (groupStatus !== "pending") continue;

      const groupStationStatuses: Record<string, OrderStatus> = {};
      const byStation = new Map<string, WorkGroupItem[]>();
      for (const item of groupItems) {
        const sid = item.stationId ?? activeStationId;
        const list = byStation.get(sid) ?? [];
        list.push(item);
        byStation.set(sid, list);
      }
      for (const [sid, stationItemsInner] of byStation) {
        groupStationStatuses[sid] = statusFromItems(stationItemsInner);
      }

      entries.push({
        id: order.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderType: order.orderType as "dine_in" | "pickup",
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        createdAt: order.createdAt,
        firedAt: order.firedAt ?? null,
        items: groupItems,
        status: "pending",
        stationStatuses: groupStationStatuses,
        stationStatusesFull: order.stationStatuses,
        prepGroup,
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
