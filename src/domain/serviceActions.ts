"use server";

import { eq, and, or, ilike, isNull, inArray, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions as sessionsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  orderItemCustomizations as orderItemCustomizationsTable,
  seats as seatsTable,
  payments as paymentsTable,
  tables as tablesTable,
  reservations as reservationsTable,
} from "@/lib/db/schema/orders";
import {
  items as itemsTable,
  customizationOptions as customizationOptionsTable,
  customizationGroups as customizationGroupsTable,
} from "@/lib/db/schema/menus";
import { merchantLocations as merchantLocationsTable } from "@/lib/db/schema";
import { floorPlans as floorPlansTable } from "@/lib/db/schema/floor-plans";
import { canFireWave, canAddItems, canRefireItem, canModifyOrderItem } from "@/domain/serviceFlow";
import {
  fireWave as fireWaveAction,
  closeSession as closeSessionAction,
  createNextWave,
  createOrderWithItemsForPickupDelivery,
  getOrderIdForSessionAndWave,
  ensureSessionForTable,
  ensureSessionForTableByTableUuid,
  updateOrderMetadata,
  cancelOrderByOrderId,
  addItemToOrderByOrderId,
  updateOrderStatusByOrderId,
  addPaymentToOrder as addPaymentToOrderAction,
  updatePaymentStatus as updatePaymentStatusAction,
  type CloseTablePayment,
  type CloseOrderForTableOptions,
  type PickupDeliveryLineItemInput,
  type AddItemToOrderByOrderIdInput,
} from "@/app/actions/orders";
import {
  markItemPreparing as markItemPreparingAction,
  markItemReady as markItemReadyAction,
  markItemServed as markItemServedAction,
  voidItem as voidItemAction,
  refireItem as refireItemAction,
} from "@/app/actions/order-item-lifecycle";
import { canCloseSession as canCloseSessionAction } from "@/app/actions/session-close-validation";
import { generateCorrelationId } from "@/lib/correlation-id";
import {
  recordSessionEvent,
  recordSessionEventWithSource,
  type EventSource,
} from "@/app/actions/session-events";
import { withTx } from "@/domain/tx";
import { emit } from "@/domain/emitter";

function safeEmit(event: Parameters<typeof emit>[0]) {
  try {
    const p = emit(event);
    if (p instanceof Promise) p.catch(() => {});
  } catch {
    /* swallow */
  }
}
import {
  addSeatToSession as addSeatToSessionAction,
  removeSeatFromSession as removeSeatFromSessionAction,
  removeSeatBySessionAndNumber as removeSeatBySessionAndNumberAction,
  renameSeatBySessionAndNumber as renameSeatBySessionAndNumberAction,
  syncSeatsWithGuestCount as syncSeatsWithGuestCountAction,
} from "@/app/actions/seat-management";
import { updateTable as updateTableAction } from "@/app/actions/tables";
import { verifyLocationAccess } from "@/lib/location-access";
import { supabaseServer } from "@/lib/supabaseServer";
import { recalculateOrderTotals, recalculateSessionTotals } from "@/domain/orderTotals";
import { getOpenWave } from "@/domain/orderHelpers";
import type { StoreTableSessionState, StoreTable } from "@/store/types";

export type AddItemCustomizationInput = {
  groupId: string;
  optionId: string;
  groupName?: string;
  optionName?: string;
  optionPrice?: string | number;
  quantity?: number;
};

export type AddItemInput = {
  itemId: string;
  quantity: number;
  seatId?: string;
  notes?: string;
  customizations?: AddItemCustomizationInput[];
};

export type AddItemsToOrderResult =
  | {
      ok: true;
      sessionId: string;
      orderId: string;
      wave: number;
      addedItemIds: string[];
      itemCount: number;
      sessionStatus: string;
      orderStatus: string;
    }
  | { ok: false; reason: string; data?: unknown };

export type ServiceResult =
  | {
      ok: true;
      sessionId?: string;
      orderId?: string;
      itemId?: string;
      seatId?: string;
      seatNumber?: number;
      wave?: number;
      firedAt?: Date;
      itemCount?: number;
      affectedItems?: string[];
      meta?: Record<string, unknown>;
      /** Correlate events triggered by the same user action (e.g. close table). */
      correlationId?: string;
    }
  | {
      ok: false;
      reason: string;
      error?: string;
      items?: Array<{ id: string; itemName: string; status: string; quantity: number }>;
      remaining?: number;
      sessionTotal?: number;
      paymentsTotal?: number;
      data?: unknown;
    };

export type BatchWaveAdvanceFailure = {
  itemId: string;
  error: string;
};

export type BatchWaveAdvanceResult =
  | {
      ok: true;
      sessionId: string;
      orderId: string;
      wave: number;
      updatedItemIds: string[];
      failed: [];
    }
  | {
      ok: false;
      reason: string;
      updatedItemIds: string[];
      failed: BatchWaveAdvanceFailure[];
      sessionId?: string;
      orderId?: string;
      wave?: number;
      data?: unknown;
    };

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Canonical session creation: get or create an open session for a table (by table number string e.g. "t1").
 * Returns ServiceResult with sessionId on success.
 * userId optional: when not provided, uses current auth user.
 */
export async function ensureSession(
  locationId: string,
  tableId: string,
  guestCount: number,
  userId?: string | null
): Promise<ServiceResult> {
  const effectiveUserId = userId ?? (await getCurrentUserId());
  if (!effectiveUserId) return { ok: false, reason: "Unauthorized" };
  const result = await ensureSessionForTable(locationId, tableId, guestCount, effectiveUserId);
  if (!result.ok) {
    const msg = result.reason === "user_not_staff" ? "You are not staff at this location" : result.reason;
    return { ok: false, reason: msg };
  }
  return { ok: true, sessionId: result.sessionId };
}

/**
 * Canonical session creation by table UUID (tables.id).
 * Used when caller has table UUID (e.g. from API).
 * userId optional: when not provided, uses current auth user.
 */
export async function ensureSessionByTableUuid(
  locationId: string,
  tableUuid: string,
  guestCount = 1,
  userId?: string | null
): Promise<ServiceResult> {
  const effectiveUserId = userId ?? (await getCurrentUserId());
  if (!effectiveUserId) return { ok: false, reason: "Unauthorized" };
  const result = await ensureSessionForTableByTableUuid(locationId, tableUuid, guestCount, effectiveUserId);
  if (!result.ok) {
    const msg = result.reason === "user_not_staff" ? "You are not staff at this location" : result.reason;
    return { ok: false, reason: msg };
  }
  return { ok: true, sessionId: result.sessionId };
}

/** API order creation input. Matches POST /api/orders body. */
export type CreateOrderFromApiInput = {
  locationId: string;
  customerId?: string | null;
  sessionId?: string | null;
  tableId?: string | null;
  reservationId?: string | null;
  assignedStaffId?: string | null;
  orderType: "dine_in" | "pickup" | "delivery";
  paymentTiming: "pay_first" | "pay_later";
  guestCount?: number;
  notes?: string | null;
  items: Array<{
    itemId?: string | null;
    itemName?: string;
    itemPrice?: string | number;
    quantity?: number;
    seatId?: string;
    notes?: string | null;
    customizations?: Array<{
      groupId?: string;
      optionId?: string;
      groupName?: string;
      optionName?: string;
      optionPrice?: string | number;
      quantity?: number;
    }>;
  }>;
  eventSource?: EventSource;
  changedByUserId?: string | null;
};

/** Result of createOrderFromApi. */
export type CreateOrderFromApiResult =
  | { ok: true; orderId: string; sessionId?: string | null; addedItemIds?: string[] }
  | { ok: false; reason: string };

/**
 * Create order from API. Orchestrates via service layer.
 * Dine-in: ensureSessionByTableUuid + addItemsToOrder.
 * Pickup/delivery: createOrderWithItemsForPickupDelivery.
 */
export async function createOrderFromApi(
  input: CreateOrderFromApiInput
): Promise<CreateOrderFromApiResult> {
  const location = await verifyLocationAccess(input.locationId);
  if (!location) return { ok: false, reason: "Unauthorized or location not found" };

  if (!input.items?.length) {
    return { ok: false, reason: "At least one item is required" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (input.orderType === "dine_in") {
    let sessionId: string | null = null;
    if (input.sessionId) {
      const sessionRow = await db.query.sessions.findFirst({
        where: and(
          eq(sessionsTable.id, input.sessionId),
          eq(sessionsTable.locationId, input.locationId),
          eq(sessionsTable.status, "open")
        ),
        columns: { id: true },
      });
      if (sessionRow) sessionId = sessionRow.id;
    }
    if (!sessionId && input.tableId) {
      const ensureUserId = input.changedByUserId ?? (await getCurrentUserId());
      if (!ensureUserId) {
        return { ok: false, reason: "Dine-in orders require authenticated user to create session" };
      }
      const ensureResult = await ensureSessionByTableUuid(
        input.locationId,
        input.tableId,
        Math.max(1, Math.floor(input.guestCount ?? 1)),
        ensureUserId
      );
      sessionId = ensureResult.ok ? ensureResult.sessionId ?? null : null;
    }
    if (!sessionId) {
      return { ok: false, reason: "Dine-in orders require sessionId or tableId to resolve/create a session" };
    }

    const itemsWithIds = input.items.filter((i) => i.itemId);
    if (itemsWithIds.length !== input.items.length) {
      return { ok: false, reason: "All items must have itemId" };
    }

    const addInputs: AddItemInput[] = itemsWithIds.map((item) => ({
      itemId: item.itemId!,
      quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
      seatId: item.seatId ?? undefined,
      notes: item.notes ?? undefined,
      customizations: item.customizations?.map((c) => ({
        groupId: c.groupId ?? "",
        optionId: c.optionId ?? "",
        groupName: c.groupName,
        optionName: c.optionName,
        optionPrice: c.optionPrice,
        quantity: c.quantity,
      })),
    }));

    const result = await addItemsToOrder(sessionId, addInputs, {
      eventSource: input.eventSource,
    });
    if (!result.ok) return { ok: false, reason: result.reason };
    return {
      ok: true,
      orderId: result.orderId,
      sessionId: result.sessionId,
      addedItemIds: result.addedItemIds,
    };
  }

  return createPickupDeliveryOrder(input);
}

async function createPickupDeliveryOrder(
  input: CreateOrderFromApiInput
): Promise<CreateOrderFromApiResult> {
  if (input.orderType !== "pickup" && input.orderType !== "delivery") {
    return { ok: false, reason: "Invalid order type" };
  }

  const location = await db.query.merchantLocations.findFirst({
    where: eq(merchantLocationsTable.id, input.locationId),
    columns: { id: true, taxRate: true, serviceChargePercentage: true },
  });
  if (!location) return { ok: false, reason: "Location not found" };

  const itemIds = input.items.map((i) => i.itemId).filter(Boolean) as string[];
  const menuItems =
    itemIds.length > 0
      ? await db.query.items.findMany({
          where: and(
            eq(itemsTable.locationId, input.locationId),
            inArray(itemsTable.id, itemIds)
          ),
          columns: { id: true, name: true, price: true },
        })
      : [];
  const itemMap = new Map(menuItems.map((m) => [m.id, m]));

  const lineItems: PickupDeliveryLineItemInput[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const menuItem = item.itemId ? itemMap.get(item.itemId) : null;
    const itemName = menuItem?.name ?? item.itemName ?? "Unknown Item";
    const itemPrice = menuItem ? Number(menuItem.price) : Number(item.itemPrice ?? 0);
    const qty = Math.max(1, Math.floor(item.quantity ?? 1));

    let customizationsTotal = 0;
    const custRows: Array<{
      groupId: string;
      optionId: string;
      groupName: string;
      optionName: string;
      optionPrice: string;
      quantity: number;
    }> = [];

    if (item.customizations?.length) {
      for (const c of item.customizations) {
        const opt = c.optionId
          ? await db.query.customizationOptions.findFirst({
              where: eq(customizationOptionsTable.id, c.optionId),
              columns: { id: true, groupId: true, name: true, price: true },
            })
          : null;
        const optPrice = opt ? Number(opt.price) : Number(c.optionPrice ?? 0);
        const custQty = Math.max(1, Math.floor(c.quantity ?? 1));
        customizationsTotal += optPrice * custQty;
        const group = opt?.groupId
          ? await db.query.customizationGroups.findFirst({
              where: eq(customizationGroupsTable.id, opt.groupId),
              columns: { name: true },
            })
          : null;
        custRows.push({
          groupId: (opt?.groupId ?? c.groupId) || "",
          optionId: (opt?.id ?? c.optionId) || "",
          groupName: group?.name ?? c.groupName ?? "Customization",
          optionName: opt?.name ?? c.optionName ?? "Option",
          optionPrice: optPrice.toFixed(2),
          quantity: custQty,
        });
      }
    }

    const lineTotal = itemPrice * qty + customizationsTotal;
    subtotal += lineTotal;
    lineItems.push({
      itemId: item.itemId ?? null,
      itemName,
      itemPrice: itemPrice.toFixed(2),
      quantity: qty,
      customizationsTotal: customizationsTotal.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
      notes: item.notes ?? null,
      customizations: custRows,
    });
  }

  const taxRate = parseFloat(String(location.taxRate ?? "21.00")) / 100;
  const serviceChargeRate = parseFloat(String(location.serviceChargePercentage ?? "0.00")) / 100;
  const taxAmount = subtotal * taxRate;
  const serviceCharge = subtotal * serviceChargeRate;
  const total = subtotal + taxAmount + serviceCharge;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayOrders = await db.query.orders.findMany({
    where: and(
      eq(ordersTable.locationId, input.locationId),
      gte(ordersTable.createdAt, today),
      lte(ordersTable.createdAt, tomorrow)
    ),
    columns: { id: true },
  });
  const orderNumber = `ORD-${String(todayOrders.length + 1).padStart(3, "0")}`;

  const result = await createOrderWithItemsForPickupDelivery(
    {
      locationId: input.locationId,
      customerId: input.customerId ?? null,
      tableId: input.tableId ?? null,
      reservationId: input.reservationId ?? null,
      assignedStaffId: input.assignedStaffId ?? null,
      orderNumber,
      orderType: input.orderType,
      paymentTiming: input.paymentTiming,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      total: total.toFixed(2),
      notes: input.notes ?? null,
    },
    lineItems,
    { changedByUserId: input.changedByUserId ?? null }
  );

  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId: result.orderId };
}

async function getItemContext(
  orderItemId: string
): Promise<{ orderId: string; sessionId: string | null } | null> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { orderId: true },
  });
  if (!item) return null;

  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, item.orderId),
    columns: { sessionId: true },
  });
  return order ? { orderId: item.orderId, sessionId: order.sessionId } : { orderId: item.orderId, sessionId: null };
}

/**
 * Update order item quantity. Validates with canModifyOrderItem, updates quantity + lineTotal, recalculates totals.
 */
export async function updateItemQuantity(
  orderItemId: string,
  quantity: number
): Promise<ServiceResult> {
  const qty = Math.max(1, Math.floor(quantity));
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: {
      id: true,
      orderId: true,
      voidedAt: true,
      sentToKitchenAt: true,
      itemPrice: true,
      customizationsTotal: true,
    },
  });
  if (!item) return { ok: false, reason: "item_not_found" };
  if (item.voidedAt) return { ok: false, reason: "item_already_voided" };

  const modifyResult = canModifyOrderItem({ sentToKitchenAt: item.sentToKitchenAt });
  if (!modifyResult.ok) return { ok: false, reason: modifyResult.reason };

  const itemPrice = parseFloat(item.itemPrice);
  const customizationsTotal = parseFloat(item.customizationsTotal);
  const lineTotal = (itemPrice * qty + customizationsTotal).toFixed(2);

  await db
    .update(orderItemsTable)
    .set({ quantity: qty, lineTotal })
    .where(eq(orderItemsTable.id, orderItemId));

  await recalculateOrderTotals(item.orderId);
  const ctx = await getItemContext(orderItemId);
  if (ctx?.sessionId) {
    await recalculateSessionTotals(ctx.sessionId);
  }

  return {
    ok: true,
    itemId: orderItemId,
    orderId: item.orderId,
    sessionId: ctx?.sessionId ?? undefined,
    affectedItems: [orderItemId],
  };
}

/**
 * Update order item notes. Validates with canModifyOrderItem, updates notes, recalculates totals.
 */
export async function updateItemNotes(
  orderItemId: string,
  notes: string | null
): Promise<ServiceResult> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { id: true, orderId: true, voidedAt: true, sentToKitchenAt: true },
  });
  if (!item) return { ok: false, reason: "item_not_found" };
  if (item.voidedAt) return { ok: false, reason: "item_already_voided" };

  const modifyResult = canModifyOrderItem({ sentToKitchenAt: item.sentToKitchenAt });
  if (!modifyResult.ok) return { ok: false, reason: modifyResult.reason };

  const notesVal = notes != null ? String(notes).trim() || null : null;
  await db
    .update(orderItemsTable)
    .set({ notes: notesVal })
    .where(eq(orderItemsTable.id, orderItemId));

  await recalculateOrderTotals(item.orderId);
  const ctx = await getItemContext(orderItemId);
  if (ctx?.sessionId) {
    await recalculateSessionTotals(ctx.sessionId);
  }

  return {
    ok: true,
    itemId: orderItemId,
    orderId: item.orderId,
    sessionId: ctx?.sessionId ?? undefined,
    affectedItems: [orderItemId],
  };
}

export type FireWaveOptions = {
  waveNumber?: number;
  station?: string;
  eventSource?: EventSource;
};

/**
 * Add items to an order: validate session, find/create active wave, insert order_items.
 * Canonical way to add items to an order.
 */
export async function addItemsToOrder(
  sessionId: string,
  items: AddItemInput[],
  options?: { eventSource?: EventSource }
): Promise<AddItemsToOrderResult> {
  if (items.length === 0) {
    return { ok: false, reason: "no_items", data: { message: "At least one item required" } };
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true, locationId: true, tableId: true },
  });
  if (!session) return { ok: false, reason: "session_not_found" };

  const addResult = canAddItems({ status: session.status });
  if (!addResult.ok) return { ok: false, reason: addResult.reason };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const sessionSeatIds = new Set(
    (
      await db.query.seats.findMany({
        where: eq(seatsTable.sessionId, sessionId),
        columns: { id: true },
      })
    ).map((s) => s.id)
  );

  for (const item of items) {
    if (item.seatId && !sessionSeatIds.has(item.seatId)) {
      return { ok: false, reason: "seat_not_in_session", data: { seatId: item.seatId } };
    }
  }

  return withTx(async (tx) => {
    let orderId: string;
    let wave: number;

    const openWave = await getOpenWave(sessionId, undefined, undefined, tx);

    if (openWave) {
      orderId = openWave.id;
      wave = openWave.wave;
    } else {
      const createResult = await createNextWave(sessionId, tx);
      if (!createResult.ok) {
        return { ok: false, reason: "create_wave_failed", data: { error: createResult.error } };
      }
      orderId = createResult.order.id;
      wave = createResult.order.wave;
    }

    let order = await tx.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    columns: { id: true, locationId: true, status: true, firedAt: true },
  });
    if (!order) return { ok: false, reason: "order_not_found" };
    // Do not attach items to fired waves: if order was fired (e.g. race), create new wave
    if (order.firedAt != null) {
      const createResult = await createNextWave(sessionId, tx);
      if (!createResult.ok) {
        return { ok: false, reason: "create_wave_failed", data: { error: createResult.error } };
      }
      orderId = createResult.order.id;
      wave = createResult.order.wave;
      const newOrder = await tx.query.orders.findFirst({
      where: eq(ordersTable.id, orderId),
      columns: { id: true, locationId: true, status: true, firedAt: true },
    });
      if (!newOrder) return { ok: false, reason: "order_not_found" };
      order = newOrder;
    }
    const orderRef = order;

    const itemIds = [...new Set(items.map((i) => i.itemId))];
    const menuItems = await tx
    .select({ id: itemsTable.id, name: itemsTable.name, price: itemsTable.price })
    .from(itemsTable)
    .where(
      and(eq(itemsTable.locationId, orderRef.locationId), inArray(itemsTable.id, itemIds))
    );
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    const now = new Date();
    const inserted: string[] = [];
    const seatBreakdown: Record<string, number> = {};
    let itemCount = 0;

    const optionIds = [...new Set(items.flatMap((i) => (i.customizations ?? []).map((c) => c.optionId)).filter(Boolean))];
    let optionMap = new Map<string, { id: string; groupId: string; name: string; price: string }>();
    let groupMap = new Map<string, string>();
    if (optionIds.length > 0) {
      const options = await tx.query.customizationOptions.findMany({
      where: inArray(customizationOptionsTable.id, optionIds),
      columns: { id: true, groupId: true, name: true, price: true },
    });
      optionMap = new Map(options.map((o) => [o.id, o]));
      const groupIds = [...new Set(options.map((o) => o.groupId).filter(Boolean))] as string[];
      if (groupIds.length > 0) {
        const groups = await tx.query.customizationGroups.findMany({
        where: inArray(customizationGroupsTable.id, groupIds),
        columns: { id: true, name: true },
      });
        groupMap = new Map(groups.map((g) => [g.id, g.name]));
      }
    }

    for (const input of items) {
    const menuItem = menuItemMap.get(input.itemId);
    if (!menuItem) {
      return { ok: false, reason: "item_not_found", data: { itemId: input.itemId } };
    }
    const qty = Math.max(1, Math.floor(input.quantity ?? 1));
    const price = Number(menuItem.price);
    let customizationsTotal = 0;
    const custRows: { groupId: string; optionId: string; groupName: string; optionName: string; optionPrice: string; quantity: number }[] = [];
    for (const cust of input.customizations ?? []) {
      const opt = optionMap.get(cust.optionId);
      const optPrice = opt ? Number(opt.price) : Number(cust.optionPrice ?? 0);
      const custQty = Math.max(1, Math.floor(cust.quantity ?? 1));
      customizationsTotal += optPrice * custQty;
      custRows.push({
        groupId: cust.groupId,
        optionId: cust.optionId,
        groupName: (opt && groupMap.get(opt.groupId)) ?? cust.groupName ?? "Customization",
        optionName: opt?.name ?? cust.optionName ?? "Option",
        optionPrice: optPrice.toFixed(2),
        quantity: custQty,
      });
    }
    const lineTotal = price * qty + customizationsTotal;
    itemCount += qty;

      const seatKey = input.seatId ?? "shared";
      seatBreakdown[seatKey] = (seatBreakdown[seatKey] ?? 0) + qty;

      const [row] = await tx
        .insert(orderItemsTable)
      .values({
        orderId: orderRef.id,
        itemId: input.itemId,
        itemName: menuItem.name,
        itemPrice: price.toFixed(2),
        quantity: qty,
        seat: 0,
        seatId: input.seatId ?? null,
        customizationsTotal: customizationsTotal.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        notes: input.notes ?? null,
        status: "pending",
      })
      .returning({ id: orderItemsTable.id });
      if (row) {
        inserted.push(row.id);
        if (custRows.length > 0) {
          await tx.insert(orderItemCustomizationsTable).values(
          custRows.map((c) => ({
            orderItemId: row.id,
            groupId: c.groupId,
            optionId: c.optionId,
            groupName: c.groupName,
            optionName: c.optionName,
            optionPrice: c.optionPrice,
            quantity: c.quantity,
            }))
          );
        }
      }
    }

    await recalculateOrderTotals(orderRef.id, tx);
    await recalculateSessionTotals(sessionId, tx);

    const correlationId = generateCorrelationId();
    const itemsAddedMeta = {
      orderId: orderRef.id,
      addedItemIds: inserted,
      wave,
      itemCount,
      seatBreakdown,
    };
    if (options?.eventSource) {
      await recordSessionEventWithSource(
        orderRef.locationId,
        sessionId,
        "items_added",
        options.eventSource,
        itemsAddedMeta,
        undefined,
        correlationId,
        tx
      );
    } else {
      await recordSessionEvent(orderRef.locationId, sessionId, "items_added", itemsAddedMeta, undefined, tx);
    }

    safeEmit({
      type: "order.items_added",
      payload: {
        sessionId,
        orderId: orderRef.id,
        wave,
        addedItemIds: inserted,
        itemCount,
      },
      correlationId,
    });

    return {
      ok: true,
      sessionId,
      orderId: orderRef.id,
      wave,
      addedItemIds: inserted,
      itemCount,
      sessionStatus: session.status,
      orderStatus: orderRef.status,
    };
  });
}

export type SyncSessionOrderResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string };

/**
 * @deprecated TODO: remove (zero usages)
 *
 * Legacy bulk order synchronization used by the early table page.
 *
 * The canonical mutation path is now incremental:
 *
 * UI → serviceActions.addItemsToOrder → validators → DB actions
 *
 * This function will be removed once all callers are migrated.
 */
export async function syncSessionOrderViaServiceLayer(
  locationId: string,
  tableId: string,
  session: StoreTableSessionState
): Promise<SyncSessionOrderResult> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const guestCount = Math.max(1, Math.floor(session.guestCount ?? 0));
  const ensureResult = await ensureSession(locationId, tableId, guestCount);
  if (!ensureResult.ok) return { ok: false, error: ensureResult.reason };
  const sessionId = ensureResult.sessionId!;

  const syncSeatsResult = await syncSeatsWithGuestCountAction(sessionId, guestCount);
  if (!syncSeatsResult.ok) return { ok: false, error: syncSeatsResult.error ?? "Failed to sync seats" };

  const sessionRow = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true },
  });
  if (!sessionRow || sessionRow.status !== "open") {
    return { ok: false, error: "Session not open" };
  }

  const seatRows = await db.query.seats.findMany({
    where: eq(seatsTable.sessionId, sessionId),
    columns: { id: true, seatNumber: true },
  });
  const seatNumberToId = new Map(seatRows.map((s) => [s.seatNumber, s.id]));

  type Line = { menuItemId: string; seatNumber: number; waveNumber: number; quantity: number; notes?: string };
  const lineMap = new Map<string, Line>();
  const key = (m: string, s: number, w: number, n?: string) => `${m}|${s}|${w}|${n ?? ""}`;
  for (const seat of session.seats) {
    for (const item of seat.items) {
      if (item.status === "void") continue;
      const menuItemId = item.menuItemId;
      if (!menuItemId) continue;
      const waveNumber = item.waveNumber ?? 1;
      const notes = item.mods?.join(" · ");
      const k = key(menuItemId, seat.number, waveNumber, notes);
      const existing = lineMap.get(k);
      if (existing) existing.quantity += 1;
      else lineMap.set(k, { menuItemId, seatNumber: seat.number, waveNumber, quantity: 1, notes });
    }
  }
  for (const item of session.tableItems) {
    if (item.status === "void") continue;
    const menuItemId = item.menuItemId;
    if (!menuItemId) continue;
    const waveNumber = item.waveNumber ?? 1;
    const notes = item.mods?.join(" · ");
    const k = key(menuItemId, 0, waveNumber, notes);
    const existing = lineMap.get(k);
    if (existing) existing.quantity += 1;
    else lineMap.set(k, { menuItemId, seatNumber: 0, waveNumber, quantity: 1, notes });
  }
  const lines = Array.from(lineMap.values());

  const linesByWave = new Map<number, Line[]>();
  for (const line of lines) {
    const list = linesByWave.get(line.waveNumber) ?? [];
    list.push(line);
    linesByWave.set(line.waveNumber, list);
  }
  const waveNumbers = linesByWave.size > 0 ? Array.from(linesByWave.keys()).sort((a, b) => a - b) : [];

  for (const waveNumber of waveNumbers) {
    let orderId: string | null = await getOrderIdForSessionAndWave(sessionId, waveNumber);
    while (!orderId) {
      const createResult = await createNextWave(sessionId);
      if (!createResult.ok) return { ok: false, error: createResult.error ?? "Failed to create wave" };
      orderId = await getOrderIdForSessionAndWave(sessionId, waveNumber);
    }
    const resolvedOrderId = orderId;

    const order = await db.query.orders.findFirst({
      where: eq(ordersTable.id, resolvedOrderId),
      columns: { id: true, firedAt: true },
    });
    if (!order || order.firedAt != null) continue;

    const existingItems = await db.query.orderItems.findMany({
      where: and(
        eq(orderItemsTable.orderId, order.id),
        isNull(orderItemsTable.voidedAt)
      ),
      columns: { id: true },
    });
    for (const oi of existingItems) {
      await voidItemAction(oi.id, "Replaced by sync", { eventSource: "system" });
    }

    const waveLines = linesByWave.get(waveNumber) ?? [];
    const addInputs: AddItemInput[] = waveLines.map((line) => ({
      itemId: line.menuItemId,
      quantity: line.quantity,
      seatId: line.seatNumber > 0 ? seatNumberToId.get(line.seatNumber) ?? undefined : undefined,
      notes: line.notes ?? undefined,
    }));

    if (addInputs.length > 0) {
      const addResult = await addItemsToOrder(sessionId, addInputs, { eventSource: "system" });
      if (!addResult.ok) return { ok: false, error: addResult.reason ?? "Failed to add items" };
    }

    if (waveNumber === 1) {
      const fireResult = await fireWave(sessionId, { waveNumber, eventSource: "system" });
      if (!fireResult.ok && fireResult.reason !== "no_wave_to_fire") {
        return { ok: false, error: fireResult.reason ?? "Failed to fire wave 1" };
      }
    }
  }

  return { ok: true, sessionId };
}

/**
 * Create the next order wave for a session. Wraps createNextWave DB action.
 * Returns ServiceResult for UI consistency.
 */
export async function createNextWaveForSession(sessionId: string): Promise<ServiceResult> {
  const result = await createNextWave(sessionId);
  if (result.ok) {
    return {
      ok: true,
      sessionId,
      orderId: result.order.id,
      wave: result.order.wave,
    };
  }
  return {
    ok: false,
    reason: "create_wave_failed",
    error: result.error,
  };
}

/**
 * Fire a wave: validate, update order/items, set sentToKitchenAt, record course_fired.
 * If waveNumber omitted, finds the lowest unfired wave with items.
 */
export async function fireWave(
  sessionId: string,
  options?: FireWaveOptions
): Promise<ServiceResult> {
  return withTx(async (tx) => {
    const session = await tx.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
      columns: { id: true, locationId: true },
    });
    if (!session) return { ok: false, reason: "session_not_found" };

    const location = await verifyLocationAccess(session.locationId);
    if (!location) return { ok: false, reason: "unauthorized" };

    let orderId: string | null;
    if (options?.waveNumber != null) {
      const openWave = await getOpenWave(sessionId, options.waveNumber, undefined, tx);
      orderId = openWave?.id ?? null;
    } else {
      let openWave = await getOpenWave(sessionId, undefined, undefined, tx);
      while (openWave) {
        const items = await tx.query.orderItems.findMany({
        where: and(
          eq(orderItemsTable.orderId, openWave.id),
          isNull(orderItemsTable.voidedAt)
        ),
          columns: { id: true },
          limit: 1,
        });
        if (items.length > 0) {
          orderId = openWave.id;
          break;
        }
        openWave = await getOpenWave(sessionId, undefined, openWave.wave, tx);
      }
      orderId ??= null;
    }

    if (!orderId) return { ok: false, reason: "no_wave_to_fire" };

    const order = await tx.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
      columns: { id: true, firedAt: true, wave: true },
    });
    if (!order) return { ok: false, reason: "order_not_found" };

    const fireResult = canFireWave({ firedAt: order.firedAt });
    if (!fireResult.ok) return { ok: false, reason: fireResult.reason };

    const result = await fireWaveAction(orderId, { eventSource: options?.eventSource }, tx);
    if (!result.ok) return { ok: false, reason: "fire_failed", data: { error: result.error } };

    if (options?.station) {
      await tx
        .update(ordersTable)
        .set({ station: options.station })
        .where(eq(ordersTable.id, orderId));
    }

    const now = new Date();
    const itemRows = await tx.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, orderId),
      isNull(orderItemsTable.voidedAt)
    ),
      columns: { id: true, quantity: true },
    });
    const itemCount = itemRows.reduce((s, i) => s + (i.quantity ?? 1), 0);
    const affectedItems = itemRows.map((i) => i.id);

    safeEmit({
      type: "wave.fired",
      payload: {
        sessionId,
        orderId,
        wave: order.wave,
        firedAt: now.toISOString(),
        itemCount,
        affectedItems,
      },
    });

    return {
      ok: true,
      sessionId,
      orderId,
      wave: order.wave,
      firedAt: now,
      itemCount,
      affectedItems,
      meta: options?.station ? { station: options.station } : undefined,
    };
  });
}

/**
 * Advance all non-voided items in a wave to a kitchen status.
 * Used when table/KDS advances an entire wave (e.g. cooking → ready → served).
 */
export async function advanceWaveStatus(
  sessionId: string,
  waveNumber: number,
  status: "preparing" | "ready" | "served",
  options?: { eventSource?: EventSource }
): Promise<BatchWaveAdvanceResult> {
  return withTx(async (tx) => {
    const session = await tx.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
      columns: { id: true, status: true, locationId: true },
    });
    if (!session) return { ok: false, reason: "session_not_found", updatedItemIds: [], failed: [] };

    const addResult = canAddItems({ status: session.status });
    if (!addResult.ok) return { ok: false, reason: addResult.reason, updatedItemIds: [], failed: [] };

    const location = await verifyLocationAccess(session.locationId);
    if (!location) return { ok: false, reason: "unauthorized", updatedItemIds: [], failed: [] };

    const order = await tx.query.orders.findFirst({
    where: and(eq(ordersTable.sessionId, sessionId), eq(ordersTable.wave, waveNumber)),
      columns: { id: true },
    });
    if (!order) {
      return {
        ok: false,
        reason: "order_not_found",
        sessionId,
        wave: waveNumber,
        updatedItemIds: [],
        failed: [],
      };
    }

    const items = await tx.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, order.id),
      isNull(orderItemsTable.voidedAt)
    ),
      columns: { id: true },
    });

    const updatedItemIds: string[] = [];
    const failed: BatchWaveAdvanceFailure[] = [];

    for (const item of items) {
      const result =
        status === "preparing"
          ? await markItemPreparingAction(item.id, tx)
          : status === "ready"
            ? await markItemReadyAction(item.id, { eventSource: options?.eventSource }, tx)
            : await markItemServedAction(item.id, { eventSource: options?.eventSource }, tx);
      if (result.ok) {
        updatedItemIds.push(item.id);
        continue;
      }
      failed.push({ itemId: item.id, error: result.error ?? "advance_failed" });
    }

    if (failed.length > 0) {
      safeEmit({
        type: "wave.advanced",
        payload: {
          sessionId,
          orderId: order.id,
          wave: waveNumber,
          status,
          updatedItemIds,
          failed,
        },
      });
      return {
        ok: false,
        reason: "advance_partial_failure",
        sessionId,
        orderId: order.id,
        wave: waveNumber,
        updatedItemIds,
        failed,
        data: { status, failedCount: failed.length, totalItems: items.length },
      };
    }

    safeEmit({
      type: "wave.advanced",
      payload: {
        sessionId,
        orderId: order.id,
        wave: waveNumber,
        status,
        updatedItemIds,
      },
    });
    return {
      ok: true,
      sessionId,
      orderId: order.id,
      wave: waveNumber,
      updatedItemIds,
      failed: [],
    };
  });
}

/** Mark item preparing: validate, set startedAt. */
export async function markItemPreparing(orderItemId: string): Promise<ServiceResult> {
  const result = await markItemPreparingAction(orderItemId);
  if (!result.ok) {
    return { ok: false, reason: "item_not_pending", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId] }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId] };
}

/** Serve an item: validate, update servedAt, record served event. */
export async function serveItem(
  orderItemId: string,
  options?: { eventSource?: EventSource }
): Promise<ServiceResult> {
  const result = await markItemServedAction(orderItemId, options);
  if (!result.ok) {
    return { ok: false, reason: "item_not_ready", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  safeEmit({
    type: "item.status_changed",
    payload: {
      itemId: orderItemId,
      orderId: ctx?.orderId ?? "",
      sessionId: ctx?.sessionId ?? null,
      status: "served",
    },
  });
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId] }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId] };
}

/** Mark item ready: validate, set readyAt, record item_ready. */
export async function markItemReady(
  orderItemId: string,
  options?: { eventSource?: EventSource }
): Promise<ServiceResult> {
  const result = await markItemReadyAction(orderItemId, options);
  if (!result.ok) {
    return { ok: false, reason: "item_not_preparing", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  safeEmit({
    type: "item.status_changed",
    payload: {
      itemId: orderItemId,
      orderId: ctx?.orderId ?? "",
      sessionId: ctx?.sessionId ?? null,
      status: "ready",
    },
  });
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId] }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId] };
}

/** Void an item: validate, set voidedAt, record item_voided. */
export async function voidItem(
  orderItemId: string,
  reason: string,
  options?: { eventSource?: EventSource }
): Promise<ServiceResult> {
  const correlationId = generateCorrelationId();
  const result = await voidItemAction(orderItemId, reason, { ...options, correlationId });
  if (!result.ok) {
    return { ok: false, reason: "item_already_voided", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  safeEmit({
    type: "item.status_changed",
    payload: {
      itemId: orderItemId,
      orderId: ctx?.orderId ?? "",
      sessionId: ctx?.sessionId ?? null,
      status: "voided",
    },
    correlationId,
  });
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId], meta: { reason } }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId], meta: { reason } };
}

/** Refire an item: validate, set refiredAt, move back to pending, record item_refired. */
export async function refireItem(
  orderItemId: string,
  reason: string,
  options?: { eventSource?: EventSource }
): Promise<ServiceResult> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { id: true, refiredAt: true },
  });
  if (!item) return { ok: false, reason: "item_not_found" };

  const refireResult = canRefireItem({ status: "", refiredAt: item.refiredAt });
  if (!refireResult.ok) return { ok: false, reason: refireResult.reason };

  const correlationId = generateCorrelationId();
  const result = await refireItemAction(orderItemId, reason, { ...options, correlationId });
  if (!result.ok) {
    return { ok: false, reason: "refire_failed", data: { error: result.error } };
  }

  await db
    .update(orderItemsTable)
    .set({
      status: "pending",
      readyAt: null,
      servedAt: null,
      startedAt: null,
    })
    .where(eq(orderItemsTable.id, orderItemId));

  const ctx = await getItemContext(orderItemId);
  safeEmit({
    type: "item.status_changed",
    payload: {
      itemId: orderItemId,
      orderId: ctx?.orderId ?? "",
      sessionId: ctx?.sessionId ?? null,
      status: "refired",
    },
  });
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId], meta: { reason } }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId], meta: { reason } };
}

// -----------------------------------------------------------------------------
// Order metadata, cancellation, status, payments (API route helpers)
// -----------------------------------------------------------------------------

export type UpdateOrderPatch = {
  customerId?: string | null;
  tableId?: string | null;
  reservationId?: string | null;
  assignedStaffId?: string | null;
  notes?: string | null;
};

export async function updateOrder(
  orderId: string,
  patch: UpdateOrderPatch
): Promise<ServiceResult> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    with: { location: { columns: { id: true, merchantId: true } } },
    columns: { id: true, locationId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await updateOrderMetadata(orderId, patch);
  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId };
}

export async function cancelOrder(orderId: string, userId: string): Promise<ServiceResult> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    with: { location: { columns: { id: true, merchantId: true } } },
    columns: { id: true, locationId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await cancelOrderByOrderId(orderId, userId);
  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId };
}

export type AddItemToExistingOrderInput = {
  itemId: string;
  quantity: number;
  notes?: string | null;
  customizations?: Array<{ groupId?: string; optionId?: string; quantity?: number }>;
};

export type AddItemToExistingOrderResult =
  | { ok: true; orderItemId: string; orderId: string }
  | { ok: false; reason: string };

export async function addItemToExistingOrder(
  orderId: string,
  input: AddItemToExistingOrderInput
): Promise<AddItemToExistingOrderResult> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    with: { location: { columns: { id: true, taxRate: true, serviceChargePercentage: true } } },
    columns: { id: true, sessionId: true, locationId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  if (order.sessionId) {
    const addInput: AddItemInput = {
      itemId: input.itemId,
      quantity: Math.max(1, input.quantity),
      notes: input.notes ?? undefined,
      customizations: (input.customizations ?? []).map((c) => ({
        groupId: c.groupId ?? "",
        optionId: c.optionId ?? "",
        quantity: c.quantity ?? 1,
      })),
    };
    const addResult = await addItemsToOrder(order.sessionId, [addInput]);
    if (!addResult.ok) return { ok: false, reason: addResult.reason };
    const itemId = addResult.addedItemIds[0];
    return { ok: true, orderItemId: itemId ?? "", orderId };
  }

  const menuItem = await db.query.items.findFirst({
    where: eq(itemsTable.id, input.itemId),
    columns: { id: true, name: true, price: true },
  });
  if (!menuItem) return { ok: false, reason: "item_not_found" };

  let customizationsTotal = 0;
  const customizationsToCreate: AddItemToOrderByOrderIdInput["customizations"] = [];
  const optionIds = [...new Set((input.customizations ?? []).map((c) => c.optionId).filter(Boolean))] as string[];
  if (optionIds.length > 0) {
    const options = await db.query.customizationOptions.findMany({
      where: inArray(customizationOptionsTable.id, optionIds),
      columns: { id: true, groupId: true, name: true, price: true },
    });
    const optionMap = new Map(options.map((o) => [o.id, o]));
    const groupIds = [...new Set(options.map((o) => o.groupId).filter(Boolean))] as string[];
    const groups = groupIds.length > 0
      ? await db.query.customizationGroups.findMany({
          where: inArray(customizationGroupsTable.id, groupIds),
          columns: { id: true, name: true },
        })
      : [];
    const groupMap = new Map(groups.map((g) => [g.id, g.name]));
    for (const cust of input.customizations ?? []) {
      const option = cust.optionId ? optionMap.get(cust.optionId) : null;
      if (option) {
        const optPrice = Number(option.price);
        const qty = Math.max(1, cust.quantity ?? 1);
        customizationsTotal += optPrice * qty;
        customizationsToCreate.push({
          groupId: option.groupId,
          optionId: option.id,
          groupName: groupMap.get(option.groupId) ?? "Customization",
          optionName: option.name,
          optionPrice: optPrice.toFixed(2),
          quantity: qty,
        });
      }
    }
  }

  const qty = Math.max(1, input.quantity);
  const itemPrice = Number(menuItem.price);
  const lineTotal = itemPrice * qty + customizationsTotal;

  const actResult = await addItemToOrderByOrderId(orderId, {
    itemId: input.itemId,
    itemName: menuItem.name,
    itemPrice,
    quantity: qty,
    customizationsTotal,
    lineTotal,
    notes: input.notes ?? null,
    customizations: customizationsToCreate,
  });
  if (!actResult.ok) return { ok: false, reason: actResult.error };
  return { ok: true, orderItemId: actResult.orderItemId, orderId };
}

export type UpdateOrderStatusInput = {
  status: string;
  note?: string | null;
  changedByStaffId?: string | null;
  changedByUserId?: string | null;
};

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput
): Promise<ServiceResult> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    with: { location: { columns: { id: true, merchantId: true } } },
    columns: { id: true, locationId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await updateOrderStatusByOrderId(orderId, input.status, {
    note: input.note,
    changedByStaffId: input.changedByStaffId,
    changedByUserId: input.changedByUserId,
  });
  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId };
}

export type AddPaymentInput = {
  amount: number;
  tipAmount?: number;
  method: string;
  provider?: string | null;
  providerTransactionId?: string | null;
  providerResponse?: unknown;
};

export async function addPayment(
  orderId: string,
  input: AddPaymentInput
): Promise<ServiceResult & { paymentId?: string }> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    with: { location: { columns: { id: true, merchantId: true } } },
    columns: { id: true, locationId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await addPaymentToOrderAction(orderId, input);
  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId, paymentId: result.paymentId };
}

export async function updatePayment(
  paymentId: string,
  status: string
): Promise<ServiceResult & { paymentId?: string }> {
  const payment = await db.query.payments.findFirst({
    where: eq(paymentsTable.id, paymentId),
    with: { order: { columns: { id: true, locationId: true } } },
    columns: { id: true, orderId: true },
  });
  if (!payment?.order) return { ok: false, reason: "payment_not_found" };
  const location = await verifyLocationAccess(payment.order.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await updatePaymentStatusAction(paymentId, status);
  if (!result.ok) return { ok: false, reason: result.error };
  return { ok: true, orderId: payment.orderId ?? undefined, paymentId };
}

// -----------------------------------------------------------------------------
// Floor plan deletion: unlink POS entities before layout deletion
// -----------------------------------------------------------------------------

/**
 * Unlink orders and reservations from the given table IDs.
 * Call before deleting tables so FK constraints are satisfied.
 * Used by floor plan deletion and table sync.
 */
export async function unlinkOrdersAndReservationsFromTableIds(
  locationId: string,
  tableIds: string[]
): Promise<ServiceResult> {
  if (tableIds.length === 0) return { ok: true };
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  await db
    .update(ordersTable)
    .set({ tableId: null, updatedAt: new Date() })
    .where(inArray(ordersTable.tableId, tableIds));
  await db
    .update(reservationsTable)
    .set({ tableId: null, updatedAt: new Date() })
    .where(inArray(reservationsTable.tableId, tableIds));

  return { ok: true };
}

/**
 * Handle POS entity updates required before deleting a floor plan.
 * Unlinks orders and reservations from tables that belong to the floor plan.
 * The floor-plans module must call this before deleting the floor plan.
 */
export async function handleFloorPlanDeletion(
  locationId: string,
  floorPlanId: string
): Promise<ServiceResult> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const floorPlan = await db.query.floorPlans.findFirst({
    where: and(
      eq(floorPlansTable.id, floorPlanId),
      eq(floorPlansTable.locationId, locationId)
    ),
    columns: { id: true },
  });
  if (!floorPlan) return { ok: false, reason: "floor_plan_not_found" };

  const planTables = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      or(eq(tablesTable.floorPlanId, floorPlanId), isNull(tablesTable.floorPlanId))
    ),
    columns: { id: true },
  });
  const tableIds = planTables.map((t) => t.id);

  return unlinkOrdersAndReservationsFromTableIds(locationId, tableIds);
}

// -----------------------------------------------------------------------------
// Table layout updates (denormalized status, guests, stage, alerts)
// -----------------------------------------------------------------------------

export type UpdateTableLayoutPatch = {
  status?: StoreTable["status"];
  guests?: number;
  seatedAt?: string | null;
  stage?: StoreTable["stage"] | null;
  alerts?: StoreTable["alerts"];
};

export type UpdateTableLayoutResult =
  | { ok: true; tableId: string; updates: UpdateTableLayoutPatch }
  | { ok: false; reason: string };

/**
 * Update table denormalized fields (status, guests, seatedAt, stage, alerts).
 * Validates input and prevents updates that conflict with active sessions.
 * Orchestrates the existing DB action in tables.ts.
 */
export async function updateTableLayout(
  locationId: string,
  tableId: string,
  updates: UpdateTableLayoutPatch
): Promise<UpdateTableLayoutResult> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) return { ok: false, reason: "table_not_found" };

  const wouldSetFree = updates.status === "free" || updates.status === "closed";
  if (wouldSetFree) {
    const openSession = await db.query.sessions.findFirst({
      where: and(
        eq(sessionsTable.tableId, tableRow.id),
        eq(sessionsTable.status, "open")
      ),
      columns: { id: true },
    });
    if (openSession) {
      return {
        ok: false,
        reason: "Cannot set table to free while a session is open. Close the session first.",
      };
    }
  }

  const result = await updateTableAction(locationId, tableId, updates);
  if (!result.ok) {
    return { ok: false, reason: result.error ?? "update_failed" };
  }

  return { ok: true, tableId, updates };
}

export type CloseSessionPayment = CloseTablePayment;

/**
 * Close a table session: validate, insert payment if provided, close session, mark orders completed.
 * Single canonical place for closing sessions.
 */
export async function closeSessionService(
  sessionId: string,
  payment?: CloseSessionPayment,
  options?: CloseOrderForTableOptions
): Promise<ServiceResult> {
  return withTx(async (tx) => {
    const correlationId = generateCorrelationId();
    const session = await tx.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
      columns: { id: true, locationId: true, tableId: true, status: true },
    });
    if (!session) return { ok: false, reason: "session_not_found" };
    if (session.status !== "open") {
      return { ok: false, reason: "session_already_closed", error: "Session already closed" };
    }

    const location = await verifyLocationAccess(session.locationId);
    if (!location) return { ok: false, reason: "unauthorized" };

    await recalculateSessionTotals(sessionId, tx);
    const canClose = await canCloseSessionAction(sessionId, {
      incomingPaymentAmount: payment?.amount,
    }, tx);
    if (!canClose.ok) {
      return {
        ok: false,
        reason: canClose.reason,
        ...(canClose.reason === "unfinished_items" && { items: canClose.items }),
        ...(canClose.reason === "unpaid_balance" && {
          remaining: canClose.remaining,
          sessionTotal: canClose.sessionTotal,
          paymentsTotal: canClose.paymentsTotal,
        }),
        data:
          canClose.reason === "unfinished_items"
            ? { items: canClose.items }
            : canClose.reason === "unpaid_balance"
              ? {
                  remaining: canClose.remaining,
                  sessionTotal: canClose.sessionTotal,
                  paymentsTotal: canClose.paymentsTotal,
                }
              : undefined,
      };
    }

    const result = await closeSessionAction(sessionId, payment, { ...options, correlationId }, tx);

    if (result.ok) {
      safeEmit({
        type: "session.closed",
        payload: { sessionId, closedAt: new Date().toISOString() },
        correlationId,
      });
    }

    if (!result.ok) {
      return {
        ok: false,
        reason: result.reason ?? "close_failed",
        error: result.error,
        items: result.items,
        remaining: result.remaining,
        sessionTotal: result.sessionTotal,
        paymentsTotal: result.paymentsTotal,
        data: {
          error: result.error,
          items: result.items,
          remaining: result.remaining,
          sessionTotal: result.sessionTotal,
          paymentsTotal: result.paymentsTotal,
        },
      };
    }

    return { ok: true, sessionId, meta: { closedAt: new Date() }, correlationId };
  });
}


// -----------------------------------------------------------------------------
// Seat lifecycle
// -----------------------------------------------------------------------------

/**
 * Add a seat to a session. seat_number = max + 1.
 * @deprecated Unused call path. Kept for compatibility until legacy removal.
 */
export async function addSeat(sessionId: string): Promise<ServiceResult> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true, locationId: true },
  });
  if (!session) return { ok: false, reason: "session_not_found" };

  const addResult = canAddItems({ status: session.status });
  if (!addResult.ok) return { ok: false, reason: addResult.reason };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const result = await addSeatToSessionAction(sessionId);
  if (!result.ok) {
    return { ok: false, reason: "add_seat_failed", data: { error: result.error } };
  }

  return {
    ok: true,
    sessionId,
    seatId: result.seat.id,
    seatNumber: result.seat.seatNumber,
  };
}

/**
 * Remove a seat by session and seat number. Wraps seat-management action.
 * Cannot delete if items exist; marks seat inactive (removed) instead.
 */
export async function removeSeatByNumber(
  sessionId: string,
  seatNumber: number
): Promise<ServiceResult> {
  const result = await removeSeatBySessionAndNumberAction(sessionId, seatNumber);
  if (!result.ok) {
    return { ok: false, reason: "remove_seat_failed", error: result.error };
  }
  return { ok: true, sessionId };
}

/**
 * Rename a seat (change seat number). Wraps seat-management action.
 */
export async function renameSeat(
  sessionId: string,
  seatNumber: number,
  newSeatNumber: number
): Promise<ServiceResult> {
  const result = await renameSeatBySessionAndNumberAction(
    sessionId,
    seatNumber,
    newSeatNumber
  );
  if (!result.ok) {
    return { ok: false, reason: "rename_seat_failed", error: result.error };
  }
  return { ok: true, sessionId };
}

/**
 * Remove a seat by seat ID. Cannot delete if items exist; marks seat inactive (removed) instead.
 * @deprecated Unused call path. Kept for compatibility until legacy removal.
 */
export async function removeSeat(seatId: string): Promise<ServiceResult> {
  const seat = await db.query.seats.findFirst({
    where: eq(seatsTable.id, seatId),
    columns: { id: true, sessionId: true, seatNumber: true },
  });
  if (!seat) return { ok: false, reason: "seat_not_found" };

  const result = await removeSeatFromSessionAction(seatId);
  if (!result.ok) {
    return { ok: false, reason: "remove_seat_failed", data: { error: result.error } };
  }

  return {
    ok: true,
    sessionId: seat.sessionId,
    seatId: seat.id,
    seatNumber: seat.seatNumber,
  };
}

/**
 * Assign an order item to a seat. Seat must belong to the session.
 * @deprecated Unused call path. Kept for compatibility until legacy removal.
 */
export async function assignItemToSeat(
  orderItemId: string,
  seatId: string
): Promise<ServiceResult> {
  return updateItemSeat(orderItemId, seatId);
}

/**
 * Move an order item to a different seat. Same validations as assignItemToSeat.
 * @deprecated Unused call path. Kept for compatibility until legacy removal.
 */
export async function moveItemToSeat(
  orderItemId: string,
  seatId: string
): Promise<ServiceResult> {
  return updateItemSeat(orderItemId, seatId);
}

async function updateItemSeat(
  orderItemId: string,
  seatId: string
): Promise<ServiceResult> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { id: true, orderId: true, voidedAt: true, sentToKitchenAt: true },
  });
  if (!item) return { ok: false, reason: "item_not_found" };
  if (item.voidedAt) return { ok: false, reason: "item_already_voided", data: { voidedAt: item.voidedAt } };

  const modifyResult = canModifyOrderItem({ sentToKitchenAt: item.sentToKitchenAt });
  if (!modifyResult.ok) return { ok: false, reason: modifyResult.reason };

  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, item.orderId),
    columns: { id: true, sessionId: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  if (!order.sessionId) return { ok: false, reason: "order_no_session" };

  const seat = await db.query.seats.findFirst({
    where: eq(seatsTable.id, seatId),
    columns: { id: true, sessionId: true, seatNumber: true },
  });
  if (!seat) return { ok: false, reason: "seat_not_found" };
  if (seat.sessionId !== order.sessionId) {
    return { ok: false, reason: "seat_not_in_session", data: { seatSessionId: seat.sessionId, orderSessionId: order.sessionId } };
  }

  await db
    .update(orderItemsTable)
    .set({ seatId, seat: seat.seatNumber })
    .where(eq(orderItemsTable.id, orderItemId));

  return {
    ok: true,
    sessionId: order.sessionId,
    orderId: order.id,
    itemId: orderItemId,
    seatId,
    seatNumber: seat.seatNumber,
    affectedItems: [orderItemId],
  };
}
