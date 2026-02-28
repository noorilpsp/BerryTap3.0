"use server";

import { eq, and, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
} from "@/lib/db/schema/orders";

/**
 * Recalculate order totals from order_items (non-voided).
 * Order totals should always be derived from order_items.
 */
export async function recalculateOrderTotals(
  orderId: string
): Promise<{ ok: boolean; subtotal?: number; error?: string }> {
  const [row] = await db
    .select({
      subtotal: sql<string>`COALESCE(SUM((${orderItemsTable.lineTotal})::numeric), 0)::numeric`,
    })
    .from(orderItemsTable)
    .where(and(eq(orderItemsTable.orderId, orderId), isNull(orderItemsTable.voidedAt)));
  const subtotal = Number(row?.subtotal ?? 0);
  const now = new Date();
  await db
    .update(ordersTable)
    .set({
      subtotal: subtotal.toFixed(2),
      taxAmount: "0.00",
      total: subtotal.toFixed(2),
      updatedAt: now,
    })
    .where(eq(ordersTable.id, orderId));
  return { ok: true, subtotal };
}

export type SessionTotalsResult = {
  subtotal: number;
  total: number;
  paid: number;
  remaining: number;
};

/**
 * Recalculate session totals by aggregating all non-cancelled orders in the session.
 * Session totals = sum of order totals for the session.
 * Also returns paid (sum of completed payments) and remaining (total - paid).
 */
export async function recalculateSessionTotals(
  sessionId: string
): Promise<{ ok: boolean; subtotal?: number; total?: number; paid?: number; remaining?: number; error?: string }> {
  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(
      and(eq(ordersTable.sessionId, sessionId), ne(ordersTable.status, "cancelled"))
    );
  let total = 0;
  for (const o of orders) {
    const result = await recalculateOrderTotals(o.id);
    if (result.ok && result.subtotal != null) {
      total += result.subtotal;
    }
  }
  const [paidRow] = await db
    .select({
      paid: sql<string>`COALESCE(SUM((${paymentsTable.amount})::numeric), 0)::numeric`,
    })
    .from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.sessionId, sessionId),
        eq(paymentsTable.status, "completed")
      )
    );
  const paid = Number(paidRow?.paid ?? 0);
  const remaining = Math.max(0, total - paid);
  return {
    ok: true,
    subtotal: total,
    total,
    paid,
    remaining,
  };
}
