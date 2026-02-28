"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  orders as ordersTable,
  orderItems as orderItemsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import {
  recordSessionEvent,
  recordSessionEventWithSource,
  type EventSource,
} from "@/app/actions/session-events";
import {
  canMarkItemPreparing,
  canMarkItemReady,
  canServeItem,
  canVoidItem,
  canRefireItem,
} from "@/domain/serviceFlow";
import { recalculateOrderTotals, recalculateSessionTotals } from "@/domain/orderTotals";

async function getItemWithOrder(orderItemId: string): Promise<{
  item: { id: string; orderId: string; status: string; voidedAt: Date | null };
  order: { id: string; sessionId: string | null; locationId: string };
} | null> {
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { id: true, orderId: true, status: true, voidedAt: true },
  });
  if (!item) return null;

  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, item.orderId),
    columns: { id: true, sessionId: true, locationId: true },
  });
  if (!order) return null;

  return {
    item: {
      ...item,
      voidedAt: item.voidedAt ?? null,
    },
    order,
  };
}

/** Mark order item as preparing (kitchen started). Valid only from pending. */
export async function markItemPreparing(
  orderItemId: string
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { item, order } = row;
  const prepResult = canMarkItemPreparing({ status: item.status, voidedAt: item.voidedAt });
  if (!prepResult.ok) {
    return { ok: false, error: `Invalid transition: ${item.status} → preparing (expected pending)` };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ status: "preparing", startedAt: now })
    .where(eq(orderItemsTable.id, orderItemId));
  return { ok: true };
}

/** Mark order item as ready (kitchen done). Valid only from preparing. */
export async function markItemReady(
  orderItemId: string,
  options?: { eventSource?: EventSource }
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { item, order } = row;
  const readyResult = canMarkItemReady({ status: item.status, voidedAt: item.voidedAt });
  if (!readyResult.ok) {
    return { ok: false, error: `Invalid transition: ${item.status} → ready (expected preparing)` };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ status: "ready", readyAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    const meta = { orderItemId, status: "ready" as const };
    if (options?.eventSource) {
      await recordSessionEventWithSource(
        order.locationId,
        order.sessionId,
        "item_ready",
        options.eventSource,
        meta
      );
    } else {
      await recordSessionEvent(order.locationId, order.sessionId, "item_ready", meta);
    }
  }
  return { ok: true };
}

/** Mark order item as served. Valid only from ready. */
export async function markItemServed(
  orderItemId: string,
  options?: { eventSource?: EventSource }
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { item, order } = row;
  const serveResult = canServeItem({ status: item.status, voidedAt: item.voidedAt });
  if (!serveResult.ok) {
    return { ok: false, error: `Invalid transition: ${item.status} → served (expected ready)` };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ status: "served", servedAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    const meta = { orderItemId };
    if (options?.eventSource) {
      await recordSessionEventWithSource(
        order.locationId,
        order.sessionId,
        "served",
        options.eventSource,
        meta
      );
    } else {
      await recordSessionEvent(order.locationId, order.sessionId, "served", meta);
    }
  }
  return { ok: true };
}

/** Void order item. Sets voided_at and records item_voided event. */
export async function voidItem(
  orderItemId: string,
  reason: string,
  options?: { eventSource?: EventSource; correlationId?: string }
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { order } = row;
  const voidResult = canVoidItem({ status: row.item.status, voidedAt: row.item.voidedAt });
  if (!voidResult.ok) {
    return { ok: false, error: "Order item already voided" };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ voidedAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  await recalculateOrderTotals(order.id);
  if (order.sessionId) {
    await recalculateSessionTotals(order.sessionId);
    const meta = { orderItemId, reason };
    if (options?.eventSource) {
      await recordSessionEventWithSource(
        order.locationId,
        order.sessionId,
        "item_voided",
        options.eventSource,
        meta,
        undefined,
        options.correlationId
      );
    } else {
      await recordSessionEvent(order.locationId, order.sessionId, "item_voided", meta);
    }
  }
  return { ok: true };
}

/** Mark order item as refired (remake). Sets refired_at and records item_refired event. */
export async function refireItem(
  orderItemId: string,
  reason: string,
  options?: { eventSource?: EventSource; correlationId?: string }
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { order } = row;
  const refireCheck = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { refiredAt: true },
  });
  const refireResult = canRefireItem({ status: row.item.status, refiredAt: refireCheck?.refiredAt });
  if (!refireResult.ok) {
    return { ok: false, error: "Order item already refired" };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ refiredAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  await recalculateOrderTotals(order.id);
  if (order.sessionId) {
    await recalculateSessionTotals(order.sessionId);
    const meta = { orderItemId, reason };
    if (options?.eventSource) {
      await recordSessionEventWithSource(
        order.locationId,
        order.sessionId,
        "item_refired",
        options.eventSource,
        meta,
        undefined,
        options.correlationId
      );
    } else {
      await recordSessionEvent(order.locationId, order.sessionId, "item_refired", meta);
    }
  }
  return { ok: true };
}
