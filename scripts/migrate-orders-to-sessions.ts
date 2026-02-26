/**
 * Data migration: existing orders → sessions + wave orders
 *
 * Run after schema migration (npm run db:push):
 * - For each order that has table_id and no session_id, create a session and set order.session_id, order.wave = 1.
 *
 * Usage: npx tsx scripts/migrate-orders-to-sessions.ts
 */

import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { db } from "../src/db";
import {
  orders as ordersTable,
  sessions as sessionsTable,
} from "../src/lib/db/schema/orders";

const ORDER_STATUS_ACTIVE = ["pending", "confirmed", "preparing", "ready"] as const;

async function migrate() {
  const ordersNeedingSession = await db.query.orders.findMany({
    where: and(
      isNull(ordersTable.sessionId),
      isNotNull(ordersTable.tableId)
    ),
    columns: {
      id: true,
      locationId: true,
      tableId: true,
      assignedStaffId: true,
      status: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (ordersNeedingSession.length === 0) {
    console.log("No orders need session backfill.");
    return;
  }

  console.log(`Backfilling sessions for ${ordersNeedingSession.length} order(s)...`);

  for (const order of ordersNeedingSession) {
    if (!order.tableId) continue;

    const [session] = await db
      .insert(sessionsTable)
      .values({
        locationId: order.locationId,
        tableId: order.tableId,
        serverId: order.assignedStaffId ?? null,
        guestCount: 0,
        openedAt: order.createdAt,
        closedAt: order.completedAt ?? null,
        status: ORDER_STATUS_ACTIVE.includes(order.status as (typeof ORDER_STATUS_ACTIVE)[number])
          ? "open"
          : "closed",
        source: "walk_in",
        updatedAt: new Date(),
      })
      .returning({ id: sessionsTable.id });

    if (!session) {
      console.warn(`Failed to create session for order ${order.id}`);
      continue;
    }

    await db
      .update(ordersTable)
      .set({ sessionId: session.id, wave: 1, updatedAt: new Date() })
      .where(eq(ordersTable.id, order.id));
  }

  console.log("Session backfill complete.");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
