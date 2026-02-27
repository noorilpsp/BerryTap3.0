"use server";

import { eq, and, inArray, sql, isNotNull, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions as sessionsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
} from "@/lib/db/schema/orders";

export type CanCloseSessionResult =
  | { ok: true }
  | { ok: false; reason: "session_not_open" }
  | { ok: false; reason: "unfinished_items"; items: UnfinishedItem[] }
  | { ok: false; reason: "unpaid_balance"; remaining: number; sessionTotal: number; paymentsTotal: number }
  | { ok: false; reason: "payment_in_progress" }
  | { ok: false; reason: "kitchen_mid_fire" };

export type UnfinishedItem = {
  id: string;
  itemName: string;
  status: string;
  quantity: number;
  orderId: string;
};

const UNFINISHED_STATUSES = ["pending", "preparing", "ready"] as const;

export type CanCloseSessionOptions = {
  /** Amount of incoming payment (not yet in DB) to include in payments total. Used when closing with payment. */
  incomingPaymentAmount?: number;
};

/** Check if a session can be closed. Returns structured result instead of throwing. */
export async function canCloseSession(
  sessionId: string,
  options?: CanCloseSessionOptions
): Promise<CanCloseSessionResult> {
  const incomingAmount = options?.incomingPaymentAmount ?? 0;
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, status: true },
  });

  if (!session) {
    return { ok: false, reason: "session_not_open" };
  }
  if (session.status !== "open") {
    return { ok: false, reason: "session_not_open" };
  }

  const orders = await db.query.orders.findMany({
    where: eq(ordersTable.sessionId, sessionId),
    columns: { id: true },
  });
  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) {
    return { ok: true };
  }

  const orderItems = await db.query.orderItems.findMany({
    where: and(
      inArray(orderItemsTable.orderId, orderIds),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: {
      id: true,
      orderId: true,
      itemName: true,
      status: true,
      quantity: true,
      sentToKitchenAt: true,
      startedAt: true,
    },
  });

  const unfinishedItems = orderItems.filter((i) =>
    UNFINISHED_STATUSES.includes(i.status as (typeof UNFINISHED_STATUSES)[number])
  );
  if (unfinishedItems.length > 0) {
    return {
      ok: false,
      reason: "unfinished_items",
      items: unfinishedItems.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        status: i.status,
        quantity: i.quantity ?? 1,
        orderId: i.orderId,
      })),
    };
  }

  const kitchenMidFire = orderItems.some(
    (i) => i.sentToKitchenAt != null && i.startedAt == null
  );
  if (kitchenMidFire) {
    return { ok: false, reason: "kitchen_mid_fire" };
  }

  const [pendingPayment] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.sessionId, sessionId),
        inArray(paymentsTable.status, ["pending"])
      )
    );
  if ((pendingPayment?.count ?? 0) > 0) {
    return { ok: false, reason: "payment_in_progress" };
  }

  const [sessionTotalRow] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${ordersTable.total}), 0)::numeric`,
    })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.sessionId, sessionId),
        ne(ordersTable.status, "cancelled")
      )
    );
  const sessionTotal = Number(sessionTotalRow?.total ?? 0);

  const [paymentsTotalRow] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${paymentsTable.amount}), 0)::numeric`,
    })
    .from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.sessionId, sessionId),
        eq(paymentsTable.status, "completed")
      )
    );
  const paymentsTotal = Number(paymentsTotalRow?.total ?? 0) + (Number.isFinite(incomingAmount) && incomingAmount >= 0 ? incomingAmount : 0);

  const remaining = sessionTotal - paymentsTotal;
  const tolerance = 0.01;
  if (remaining > tolerance) {
    return {
      ok: false,
      reason: "unpaid_balance",
      remaining: Math.round(remaining * 100) / 100,
      sessionTotal: Math.round(sessionTotal * 100) / 100,
      paymentsTotal: Math.round(paymentsTotal * 100) / 100,
    };
  }

  return { ok: true };
}

export type OutstandingItemsResult = {
  canClose: boolean;
  reason?:
    | "session_not_open"
    | "unfinished_items"
    | "unpaid_balance"
    | "payment_in_progress"
    | "kitchen_mid_fire";
  unfinishedItems?: UnfinishedItem[];
  remaining?: number;
};

/** Returns items and issues still blocking session closure. Useful for UI. */
export async function getSessionOutstandingItems(
  sessionId: string
): Promise<OutstandingItemsResult> {
  const result = await canCloseSession(sessionId);
  if (result.ok) {
    return { canClose: true };
  }
  return {
    canClose: false,
    reason: result.reason,
    ...(result.reason === "unfinished_items" && { unfinishedItems: result.items }),
    ...(result.reason === "unpaid_balance" && { remaining: result.remaining }),
  };
}
