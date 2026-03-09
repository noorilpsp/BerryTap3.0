-- Configurable substations (lanes) per station.
-- Apply with: npm run db:migrate:0010
CREATE TABLE IF NOT EXISTS "location_substations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "station_id" uuid NOT NULL REFERENCES "location_stations"("id") ON DELETE CASCADE,
  "key" varchar(50) NOT NULL,
  "name" varchar(100) NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "location_substations_station_id_idx" ON "location_substations" ("station_id");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_location_substations_station_key" ON "location_substations" ("station_id", "key");

-- Seed default substations for kitchen stations (backward compatibility)
INSERT INTO "location_substations" ("station_id", "key", "name", "display_order")
SELECT ls.id, 'grill', 'Grill', 0
FROM "location_stations" ls
WHERE ls.key = 'kitchen'
UNION ALL
SELECT ls.id, 'fryer', 'Fryer', 1
FROM "location_stations" ls
WHERE ls.key = 'kitchen'
UNION ALL
SELECT ls.id, 'cold_prep', 'Cold Prep', 2
FROM "location_stations" ls
WHERE ls.key = 'kitchen'
ON CONFLICT ("station_id", "key") DO NOTHING;
