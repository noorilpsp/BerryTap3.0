-- Table lookup by (location_id, display_id) for POS /api/tables/[id]/pos when id is displayId (e.g. t1)
-- Apply with: psql $POSTGRES_URL -f drizzle/0004_tables_indexes.sql
-- Query: WHERE location_id = ANY($1::uuid[]) AND display_id = $2
CREATE INDEX IF NOT EXISTS "tables_location_id_display_id_idx"
ON "tables" ("location_id", "display_id");
