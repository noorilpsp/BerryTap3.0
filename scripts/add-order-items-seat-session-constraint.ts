/**
 * Add constraint: order_items.seat_id must reference a seat that belongs to the same session as the order.
 * Run after db:push. Usage: npx tsx scripts/add-order-items-seat-session-constraint.ts
 *
 * Requires raw SQL execution. Uses the same db client - check your setup for executing raw SQL.
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addConstraint() {
  try {
    await sql`
      ALTER TABLE order_items
      ADD CONSTRAINT order_items_seat_matches_order_session
      CHECK (
        seat_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM orders o
          JOIN seats s ON s.id = order_items.seat_id
          WHERE o.id = order_items.order_id
            AND o.session_id IS NOT NULL
            AND o.session_id = s.session_id
        )
      )
    `;
    console.log("Constraint order_items_seat_matches_order_session added successfully.");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      console.log("Constraint already exists.");
    } else {
      console.error("Failed to add constraint:", err);
      process.exit(1);
    }
  }
}

addConstraint();
