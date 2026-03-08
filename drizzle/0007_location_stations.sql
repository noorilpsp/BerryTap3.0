-- Location-specific KDS stations.
-- Apply with: npm run db:migrate:0007
CREATE TABLE IF NOT EXISTS "location_stations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "location_id" uuid NOT NULL REFERENCES "merchant_locations"("id") ON DELETE CASCADE,
  "key" varchar(50) NOT NULL,
  "name" varchar(100) NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "location_stations_location_id_idx" ON "location_stations" ("location_id");
CREATE INDEX IF NOT EXISTS "location_stations_location_id_is_active_idx" ON "location_stations" ("location_id", "is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_location_stations_location_key" ON "location_stations" ("location_id", "key");

-- Seed default stations (kitchen, bar, dessert) for each existing location
INSERT INTO "location_stations" ("location_id", "key", "name", "display_order", "is_active")
SELECT id, 'kitchen', 'Kitchen', 0, true FROM merchant_locations
UNION ALL
SELECT id, 'bar', 'Bar', 1, true FROM merchant_locations
UNION ALL
SELECT id, 'dessert', 'Dessert', 2, true FROM merchant_locations
ON CONFLICT ("location_id", "key") DO NOTHING;
