-- POS helper indexes for getSessionOutstandingItems and checkKitchenDelays
-- Apply with: psql $POSTGRES_URL -f drizzle/0003_pos_helper_indexes.sql
-- getSessionOutstandingItems: order_items WHERE order_id = ANY($1::uuid[]) AND voided_at IS NULL
--   → order_items_order_id_voided_at_idx (already in 0002)
-- checkKitchenDelays: order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL
--   → partial index for in-flight kitchen items
CREATE INDEX IF NOT EXISTS "order_items_kitchen_delays_idx" ON "order_items" ("order_id")
  WHERE voided_at IS NULL AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL;
