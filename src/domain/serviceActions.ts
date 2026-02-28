"use server";

import { eq, and, isNull, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions as sessionsTable,
  tables as tablesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  seats as seatsTable,
} from "@/lib/db/schema/orders";
import { items as itemsTable } from "@/lib/db/schema/menus";
import { canFireWave, canAddItems, canRefireItem, canModifyOrderItem } from "@/domain/serviceFlow";
import {
  fireWave as fireWaveAction,
  closeOrderForTable,
  createNextWave,
  type CloseTablePayment,
  type CloseOrderForTableOptions,
} from "@/app/actions/orders";
import {
  markItemPreparing as markItemPreparingAction,
  markItemReady as markItemReadyAction,
  markItemServed as markItemServedAction,
  voidItem as voidItemAction,
  refireItem as refireItemAction,
} from "@/app/actions/order-item-lifecycle";
import { canCloseSession as canCloseSessionAction } from "@/app/actions/session-close-validation";
import { recordSessionEvent } from "@/app/actions/session-events";
import {
  addSeatToSession as addSeatToSessionAction,
  removeSeatFromSession as removeSeatFromSessionAction,
} from "@/app/actions/seat-management";
import { verifyLocationAccess } from "@/lib/location-access";
import { recalculateOrderTotals, recalculateSessionTotals } from "@/domain/orderTotals";
import { getOpenWave } from "@/domain/orderHelpers";

export type AddItemInput = {
  itemId: string;
  quantity: number;
  seatId?: string;
  notes?: string;
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

export type SendWaveToKitchenResult =
  | { ok: true; sessionId: string; orderId: string; wave: number; firedAt: Date; itemCount: number }
  | { ok: false; reason: "order_not_found" | "wave_already_fired" | "session_not_open" | "empty_wave"; data?: unknown };

export type FireWaveOptions = {
  waveNumber?: number;
  station?: string;
};

/**
 * Add items to an order: validate session, find/create active wave, insert order_items.
 * Canonical way to add items to an order.
 */
export async function addItemsToOrder(
  sessionId: string,
  items: AddItemInput[]
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

  let orderId: string;
  let wave: number;

  const openWave = await getOpenWave(sessionId);

  if (openWave) {
    orderId = openWave.id;
    wave = openWave.wave;
  } else {
    const createResult = await createNextWave(sessionId);
    if (!createResult.ok) {
      return { ok: false, reason: "create_wave_failed", data: { error: createResult.error } };
    }
    orderId = createResult.order.id;
    wave = createResult.order.wave;
  }

  let order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    columns: { id: true, locationId: true, status: true, firedAt: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  // Do not attach items to fired waves: if order was fired (e.g. race), create new wave
  if (order.firedAt != null) {
    const createResult = await createNextWave(sessionId);
    if (!createResult.ok) {
      return { ok: false, reason: "create_wave_failed", data: { error: createResult.error } };
    }
    orderId = createResult.order.id;
    wave = createResult.order.wave;
    const newOrder = await db.query.orders.findFirst({
      where: eq(ordersTable.id, orderId),
      columns: { id: true, locationId: true, status: true },
    });
    if (!newOrder) return { ok: false, reason: "order_not_found" };
    order = newOrder;
  }

  const itemIds = [...new Set(items.map((i) => i.itemId))];
  const menuItems = await db
    .select({ id: itemsTable.id, name: itemsTable.name, price: itemsTable.price })
    .from(itemsTable)
    .where(
      and(eq(itemsTable.locationId, order.locationId), inArray(itemsTable.id, itemIds))
    );
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const now = new Date();
  const inserted: string[] = [];
  const seatBreakdown: Record<string, number> = {};
  let itemCount = 0;

  // TODO: Use transaction when DB layer supports it (neon-http does not). Avoids partial writes when multiple devices add items.

  for (const input of items) {
    const menuItem = menuItemMap.get(input.itemId);
    if (!menuItem) {
      return { ok: false, reason: "item_not_found", data: { itemId: input.itemId } };
    }
    const qty = Math.max(1, Math.floor(input.quantity ?? 1));
    const price = Number(menuItem.price);
    const lineTotal = price * qty;
    itemCount += qty;

    const seatKey = input.seatId ?? "shared";
    seatBreakdown[seatKey] = (seatBreakdown[seatKey] ?? 0) + qty;

    const [row] = await db
      .insert(orderItemsTable)
      .values({
        orderId: order.id,
        itemId: input.itemId,
        itemName: menuItem.name,
        itemPrice: price.toFixed(2),
        quantity: qty,
        seat: 0,
        seatId: input.seatId ?? null,
        customizationsTotal: "0.00",
        lineTotal: lineTotal.toFixed(2),
        notes: input.notes ?? null,
        status: "pending",
      })
      .returning({ id: orderItemsTable.id });
    if (row) inserted.push(row.id);
  }

  await recalculateOrderTotals(order.id);
  await recalculateSessionTotals(sessionId);

  await recordSessionEvent(order.locationId, sessionId, "items_added", {
    orderId: order.id,
    addedItemIds: inserted,
    wave,
    itemCount,
    seatBreakdown,
  });

  return {
    ok: true,
    sessionId,
    orderId: order.id,
    wave,
    addedItemIds: inserted,
    itemCount,
    sessionStatus: session.status,
    orderStatus: order.status,
  };
}

/**
 * Canonical operation when server presses "Send" — send wave to kitchen.
 * Centralized: load session + order, validate, update order/items, record course_fired.
 */
export async function sendWaveToKitchen(
  sessionId: string,
  waveNumber: number,
  options?: { station?: string }
): Promise<SendWaveToKitchenResult> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true, locationId: true },
  });
  if (!session) return { ok: false, reason: "session_not_open" };
  if (session.status !== "open") return { ok: false, reason: "session_not_open" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "session_not_open", data: { message: "Unauthorized" } };

  const order = await getOpenWave(sessionId, waveNumber);
  if (!order) return { ok: false, reason: "order_not_found" };

  const fireResult = canFireWave({ firedAt: order.firedAt });
  if (!fireResult.ok) return { ok: false, reason: "wave_already_fired" };

  const nonVoidedCount = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, order.id),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true },
  });
  if (nonVoidedCount.length === 0) return { ok: false, reason: "empty_wave" };

  const itemsToUpdate = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, order.id),
      isNull(orderItemsTable.sentToKitchenAt),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true, quantity: true },
  });
  const itemCount = itemsToUpdate.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  const now = new Date();

  const [updatedOrder] = await db
    .update(ordersTable)
    .set({
      firedAt: now,
      status: "confirmed",
      updatedAt: now,
      ...(options?.station != null && { station: options.station }),
    })
    .where(and(eq(ordersTable.id, order.id), isNull(ordersTable.firedAt)))
    .returning({ id: ordersTable.id });

  if (!updatedOrder) {
    return { ok: false, reason: "wave_already_fired" };
  }

  for (const item of itemsToUpdate) {
    await db
      .update(orderItemsTable)
      .set({ sentToKitchenAt: now })
      .where(eq(orderItemsTable.id, item.id));
  }

  const station = options?.station ?? order.station ?? null;
  await recordSessionEvent(session.locationId, sessionId, "course_fired", {
    wave: waveNumber,
    itemCount,
    ...(station != null && { station }),
  });

  return {
    ok: true,
    sessionId,
    orderId: order.id,
    wave: waveNumber,
    firedAt: now,
    itemCount,
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
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session) return { ok: false, reason: "session_not_found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  let orderId: string | null;
  if (options?.waveNumber != null) {
    const openWave = await getOpenWave(sessionId, options.waveNumber);
    orderId = openWave?.id ?? null;
  } else {
    let openWave = await getOpenWave(sessionId);
    while (openWave) {
      const items = await db.query.orderItems.findMany({
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
      openWave = await getOpenWave(sessionId, undefined, openWave.wave);
    }
    orderId ??= null;
  }

  if (!orderId) return { ok: false, reason: "no_wave_to_fire" };

  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    columns: { id: true, firedAt: true, wave: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };

  const fireResult = canFireWave({ firedAt: order.firedAt });
  if (!fireResult.ok) return { ok: false, reason: fireResult.reason };

  const result = await fireWaveAction(orderId);
  if (!result.ok) return { ok: false, reason: "fire_failed", data: { error: result.error } };

  if (options?.station) {
    await db
      .update(ordersTable)
      .set({ station: options.station })
      .where(eq(ordersTable.id, orderId));
  }

  const now = new Date();
  const itemRows = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, orderId),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true, quantity: true },
  });
  const itemCount = itemRows.reduce((s, i) => s + (i.quantity ?? 1), 0);
  const affectedItems = itemRows.map((i) => i.id);

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
}

/**
 * Advance all non-voided items in a wave to a kitchen status.
 * Used when table/KDS advances an entire wave (e.g. cooking → ready → served).
 */
export async function advanceWaveStatus(
  sessionId: string,
  waveNumber: number,
  status: "preparing" | "ready" | "served"
): Promise<ServiceResult> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true, locationId: true },
  });
  if (!session) return { ok: false, reason: "session_not_found" };

  const addResult = canAddItems({ status: session.status });
  if (!addResult.ok) return { ok: false, reason: addResult.reason };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  const order = await db.query.orders.findFirst({
    where: and(eq(ordersTable.sessionId, sessionId), eq(ordersTable.wave, waveNumber)),
    columns: { id: true },
  });
  if (!order) return { ok: false, reason: "order_not_found" };

  const items = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, order.id),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true },
  });

  const helper =
    status === "preparing"
      ? markItemPreparingAction
      : status === "ready"
        ? markItemReadyAction
        : markItemServedAction;

  for (const item of items) {
    const result = await helper(item.id);
    if (!result.ok) {
      return { ok: false, reason: "advance_failed", data: { error: result.error } };
    }
  }

  return {
    ok: true,
    sessionId,
    orderId: order.id,
    wave: waveNumber,
    affectedItems: items.map((i) => i.id),
  };
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
export async function serveItem(orderItemId: string): Promise<ServiceResult> {
  const result = await markItemServedAction(orderItemId);
  if (!result.ok) {
    return { ok: false, reason: "item_not_ready", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId] }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId] };
}

/** Mark item ready: validate, set readyAt, record item_ready. */
export async function markItemReady(orderItemId: string): Promise<ServiceResult> {
  const result = await markItemReadyAction(orderItemId);
  if (!result.ok) {
    return { ok: false, reason: "item_not_preparing", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId] }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId] };
}

/** Void an item: validate, set voidedAt, record item_voided. */
export async function voidItem(orderItemId: string, reason: string): Promise<ServiceResult> {
  const result = await voidItemAction(orderItemId, reason);
  if (!result.ok) {
    return { ok: false, reason: "item_already_voided", data: { error: result.error } };
  }
  const ctx = await getItemContext(orderItemId);
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId], meta: { reason } }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId], meta: { reason } };
}

/** Refire an item: validate, set refiredAt, move back to pending, record item_refired. */
export async function refireItem(orderItemId: string, reason: string): Promise<ServiceResult> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { id: true, refiredAt: true },
  });
  if (!item) return { ok: false, reason: "item_not_found" };

  const refireResult = canRefireItem({ status: "", refiredAt: item.refiredAt });
  if (!refireResult.ok) return { ok: false, reason: refireResult.reason };

  const result = await refireItemAction(orderItemId, reason);
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
  return ctx
    ? { ok: true, itemId: orderItemId, orderId: ctx.orderId, sessionId: ctx.sessionId ?? undefined, affectedItems: [orderItemId], meta: { reason } }
    : { ok: true, itemId: orderItemId, affectedItems: [orderItemId], meta: { reason } };
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
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true, tableId: true },
  });
  if (!session) return { ok: false, reason: "session_not_found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, reason: "unauthorized" };

  await recalculateSessionTotals(sessionId);
  const canClose = await canCloseSessionAction(sessionId, {
    incomingPaymentAmount: payment?.amount,
  });
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

  const table = await db.query.tables.findFirst({
    where: eq(tablesTable.id, session.tableId),
    columns: { tableNumber: true },
  });
  if (!table) return { ok: false, reason: "table_not_found" };

  // TODO: Refactor to close sessions directly by sessionId instead of via tableId.
  // The system is now session-based. closeOrderForTable is legacy table-based logic that
  // looks up the open session by table, then closes it. Future refactor should introduce
  // closeSession(sessionId, payment?, options?) that operates on sessionId directly,
  // avoiding the table indirection and reducing technical debt.
  const result = await closeOrderForTable(
    session.locationId,
    table.tableNumber,
    payment,
    options
  );

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

  return { ok: true, sessionId, meta: { closedAt: new Date() } };
}

// -----------------------------------------------------------------------------
// Seat lifecycle
// -----------------------------------------------------------------------------

/**
 * Add a seat to a session. seat_number = max + 1.
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
 * Remove a seat. Cannot delete if items exist; marks seat inactive (removed) instead.
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
 */
export async function assignItemToSeat(
  orderItemId: string,
  seatId: string
): Promise<ServiceResult> {
  return updateItemSeat(orderItemId, seatId);
}

/**
 * Move an order item to a different seat. Same validations as assignItemToSeat.
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
