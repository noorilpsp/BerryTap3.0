-- Outstanding validation (canCloseSession): orders by session+status, payments by session+status
-- Apply with: psql $POSTGRES_URL -f drizzle/0005_close_validation_indexes.sql
-- pendingPayments: payments WHERE session_id = ? AND status != 'refunded'
-- totals: orders WHERE session_id = ? AND status != 'cancelled'
CREATE INDEX IF NOT EXISTS "orders_session_id_status_idx"
ON "orders" ("session_id", "status");

CREATE INDEX IF NOT EXISTS "payments_session_id_status_idx"
ON "payments" ("session_id", "status");
