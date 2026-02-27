"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  orders as ordersTable,
  orderItems as orderItemsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import { recordSessionEvent } from "@/app/actions/session-events";

type ItemStatus = "pending" | "preparing" | "ready" | "served";

const VALID_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  pending: ["preparing"],
  preparing: ["ready"],
  ready: ["served"],
  served: [],
};

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
  const status = item.status as ItemStatus;
  if (!VALID_TRANSITIONS[status]?.includes("preparing")) {
    return { ok: false, error: `Invalid transition: ${status} → preparing (expected pending)` };
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
  orderItemId: string
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { item, order } = row;
  const status = item.status as ItemStatus;
  if (!VALID_TRANSITIONS[status]?.includes("ready")) {
    return { ok: false, error: `Invalid transition: ${status} → ready (expected preparing)` };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ status: "ready", readyAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    await recordSessionEvent(order.locationId, order.sessionId, "item_ready", {
      orderItemId,
      status: "ready",
    });
  }
  return { ok: true };
}

/** Mark order item as served. Valid only from ready. */
export async function markItemServed(
  orderItemId: string
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { item, order } = row;
  const status = item.status as ItemStatus;
  if (!VALID_TRANSITIONS[status]?.includes("served")) {
    return { ok: false, error: `Invalid transition: ${status} → served (expected ready)` };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ status: "served", servedAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    await recordSessionEvent(order.locationId, order.sessionId, "served", {
      orderItemId,
    });
  }
  return { ok: true };
}

/** Void order item. Sets voided_at and records item_voided event. */
export async function voidItem(
  orderItemId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { order } = row;
  if (row.item.voidedAt) {
    return { ok: false, error: "Order item already voided" };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ voidedAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    await recordSessionEvent(order.locationId, order.sessionId, "item_voided", {
      orderItemId,
      reason,
    });
  }
  return { ok: true };
}

/** Mark order item as refired (remake). Sets refired_at and records item_refired event. */
export async function refireItem(
  orderItemId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const row = await getItemWithOrder(orderItemId);
  if (!row) return { ok: false, error: "Order item not found" };

  const { order } = row;
  const item = await db.query.orderItems.findFirst({
    where: eq(orderItemsTable.id, orderItemId),
    columns: { refiredAt: true },
  });
  if (item?.refiredAt) {
    return { ok: false, error: "Order item already refired" };
  }

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const now = new Date();
  await db
    .update(orderItemsTable)
    .set({ refiredAt: now })
    .where(eq(orderItemsTable.id, orderItemId));

  if (order.sessionId) {
    await recordSessionEvent(order.locationId, order.sessionId, "item_refired", {
      orderItemId,
      reason,
    });
  }
  return { ok: true };
}
