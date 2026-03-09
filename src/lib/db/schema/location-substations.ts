import { pgTable, uuid, varchar, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { locationStations } from "./location-stations";

/**
 * Substations (lanes) per station. Used for KDS preparing view and menu item lane assignment.
 * Each station can have its own lanes (e.g. kitchen: grill, fryer, cold_prep).
 */
export const locationSubstations = pgTable(
  "location_substations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stationId: uuid("station_id")
      .notNull()
      .references(() => locationStations.id, { onDelete: "cascade" }),
    /** Stable key (e.g. "grill", "fryer"). Unique per station. */
    key: varchar("key", { length: 50 }).notNull(),
    /** Display name (e.g. "Grill", "Fryer"). */
    name: varchar("name", { length: 100 }).notNull(),
    /** Sort order for KDS lane columns. */
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("location_substations_station_id_idx").on(table.stationId),
    unique("uq_location_substations_station_key").on(table.stationId, table.key),
  ]
);

export type LocationSubstation = typeof locationSubstations.$inferSelect;
export type NewLocationSubstation = typeof locationSubstations.$inferInsert;
