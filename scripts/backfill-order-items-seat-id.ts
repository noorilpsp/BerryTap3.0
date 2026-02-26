/**
 * Backfill order_items.seat_id from order_items.seat (legacy seat number).
 *
 * For each order_item with seat number set:
 * - Resolve order -> session_id.
 * - Ensure session has a seat row for that seat_number (create if missing).
 * - Set order_items.seat_id to that seat.id.
 *
 * Run after schema has seats table and order_items.seat_id.
 * Usage: npx tsx scripts/backfill-order-items-seat-id.ts
 */

import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../src/db";
import {
  orderItems as orderItemsTable,
  orders as ordersTable,
  seats as seatsTable,
  sessions as sessionsTable,
} from "../src/lib/db/schema/orders";

async function backfill() {
  const itemsWithSeatNoId = await db.query.orderItems.findMany({
    where: and(
      gt(orderItemsTable.seat, 0),
      isNull(orderItemsTable.seatId)
    ),
    columns: { id: true, orderId: true, seat: true },
  });

  if (itemsWithSeatNoId.length === 0) {
    console.log("No order_items need seat_id backfill.");
    return;
  }

  console.log(`Backfilling seat_id for ${itemsWithSeatNoId.length} order item(s)...`);

  let updated = 0;
  for (const item of itemsWithSeatNoId) {
    const order = await db.query.orders.findFirst({
      where: eq(ordersTable.id, item.orderId),
      columns: { sessionId: true },
    });
    if (!order?.sessionId) {
      continue;
    }

    let seat = await db.query.seats.findFirst({
      where: and(
        eq(seatsTable.sessionId, order.sessionId),
        eq(seatsTable.seatNumber, item.seat)
      ),
      columns: { id: true },
    });

    if (!seat) {
      const [inserted] = await db
        .insert(seatsTable)
        .values({
          sessionId: order.sessionId,
          seatNumber: item.seat,
          updatedAt: new Date(),
        })
        .returning({ id: seatsTable.id });
      seat = inserted ?? undefined;
    }
    if (!seat) continue;

    await db
      .update(orderItemsTable)
      .set({ seatId: seat.id })
      .where(eq(orderItemsTable.id, item.id));
    updated++;
  }

  console.log(`Backfill complete: ${updated} order_items updated.`);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
