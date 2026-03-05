"use server";

import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";

const DEV = process.env.NODE_ENV !== "production";

function devLogOrderItems(label: string, orderIds: string[], rows: unknown[]): void {
  if (!DEV) return;
  const sql =
    "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL";
  // eslint-disable-next-line no-console
  console.log(`[pos] ${label}`, { sql, params: [orderIds], rows: rows.length });
}
import {
  orderItems as orderItemsTable,
  orders as ordersTable,
  sessions as sessionsTable,
} from "@/lib/db/schema/orders";
import { recordSessionEventWithSource } from "@/app/actions/session-events";

export type KitchenDelayItem = {
  orderItemId: string;
  minutesLate: number;
  station: string | null;
};

export type DetectKitchenDelaysOptions = {
  /** Minutes before warning (default 10) */
  warningMinutes?: number;
  /** Minutes before critical (default 20); items beyond this are still included with their actual minutesLate */
  criticalMinutes?: number;
  /** Whether to record session events for each delayed item (default true) */
  recordEvents?: boolean;
};

const DEFAULT_WARNING_MINUTES = 10;

const MS_PER_MINUTE = 60 * 1000;

/**
 * Find order items sent to kitchen but not yet ready, where the delay exceeds the threshold.
 * Records session events (type = kitchen_delay, meta = { orderItemId, minutesLate }) for each.
 * Helper only — does not run automatically.
 */
export async function detectKitchenDelays(
  sessionId: string,
  options?: DetectKitchenDelaysOptions
): Promise<KitchenDelayItem[]> {
  const warningMinutes = options?.warningMinutes ?? DEFAULT_WARNING_MINUTES;
  const recordEvents = options?.recordEvents ?? true;

  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session) return [];

  const orders = await db.query.orders.findMany({
    where: eq(ordersTable.sessionId, sessionId),
    columns: { id: true, station: true },
  });
  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return [];

  const orderIdToStation = new Map(orders.map((o) => [o.id, o.station ?? null]));

  const items = await db.query.orderItems.findMany({
    where: and(
      inArray(orderItemsTable.orderId, orderIds),
      isNotNull(orderItemsTable.sentToKitchenAt),
      isNull(orderItemsTable.readyAt),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: {
      id: true,
      orderId: true,
      sentToKitchenAt: true,
      stationOverride: true,
    },
  });
  devLogOrderItems("checkKitchenDelays/order_items", orderIds, items);

  const now = Date.now();
  const results: KitchenDelayItem[] = [];

  for (const item of items) {
    const sentAt = item.sentToKitchenAt
      ? (item.sentToKitchenAt instanceof Date
          ? item.sentToKitchenAt.getTime()
          : new Date(item.sentToKitchenAt as string).getTime())
      : 0;
    const elapsedMs = now - sentAt;
    const minutesLate = Math.floor(elapsedMs / MS_PER_MINUTE);

    if (minutesLate < warningMinutes) continue;

    const orderStation = orderIdToStation.get(item.orderId) ?? null;
    const station = item.stationOverride ?? orderStation;

    results.push({
      orderItemId: item.id,
      minutesLate,
      station,
    });

    if (recordEvents) {
      await recordSessionEventWithSource(
        session.locationId,
        sessionId,
        "kitchen_delay",
        "system",
        { orderItemId: item.id, minutesLate }
      );
    }
  }

  return results;
}
