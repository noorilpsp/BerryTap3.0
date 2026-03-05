-- POS hot-path indexes (based on logged SQL from orders/waves/fire endpoints)
-- Apply with: psql $POSTGRES_URL -f drizzle/0002_pos_hot_path_indexes.sql
-- Or run db:push after schema changes (drizzle-kit push syncs schema)

-- getOpenWave: WHERE session_id = ? AND fired_at IS NULL ORDER BY wave LIMIT 1
CREATE INDEX IF NOT EXISTS "orders_session_id_fired_at_idx" ON "orders" ("session_id", "fired_at");

-- order_items: WHERE order_id = ? AND voided_at IS NULL (fire flow)
CREATE INDEX IF NOT EXISTS "order_items_order_id_voided_at_idx" ON "order_items" ("order_id", "voided_at");

-- seats: WHERE session_id = ? AND status = 'active' (addItemsToOrder / pos)
CREATE INDEX IF NOT EXISTS "seats_session_id_status_idx" ON "seats" ("session_id", "status");
