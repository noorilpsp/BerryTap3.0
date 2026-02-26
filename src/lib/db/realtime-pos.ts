/**
 * Realtime-friendly helpers for POS data.
 * Queries use indexed columns (session_id, order_id) so they are efficient
 * when refetching after a realtime event (e.g. subscribe to session changes, then fetch by session_id).
 */

import { db } from "@/db";
import type { Session, Order, OrderItem } from "@/lib/db/schema/orders";

/** Fetch a single session by id. Use for realtime refetch after session change. */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const row = await db.query.sessions.findFirst({
    where: (sessions, { eq }) => eq(sessions.id, sessionId),
  });
  return row ?? null;
}

/** Fetch all orders for a session (waves). Use after session or order change. */
export async function getOrdersBySessionId(sessionId: string): Promise<Order[]> {
  return db.query.orders.findMany({
    where: (orders, { eq }) => eq(orders.sessionId, sessionId),
    orderBy: (orders, { asc }) => [asc(orders.wave)],
  });
}

/** Fetch all order items for an order. Use after order or item change. */
export async function getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
  return db.query.orderItems.findMany({
    where: (orderItems, { eq }) => eq(orderItems.orderId, orderId),
  });
}

/** Full session payload for a single refetch: session + orders + order_items. */
export async function getSessionWithOrdersAndItems(sessionId: string): Promise<{
  session: Session | null;
  orders: Order[];
  orderItems: OrderItem[];
} | null> {
  const session = await getSessionById(sessionId);
  if (!session) return null;
  const orders = await getOrdersBySessionId(sessionId);
  const orderIds = orders.map((o) => o.id);
  const itemRows = orderIds.length
    ? await Promise.all(orderIds.map((id) => getOrderItemsByOrderId(id)))
    : [];
  const orderItems = itemRows.flat();
  return { session, orders, orderItems };
}
