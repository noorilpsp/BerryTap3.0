import { pgTable, uuid, varchar, integer, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { merchantLocations } from "./merchant-locations";

/**
 * Location-specific KDS stations.
 * Each location has its own set of stations (e.g. kitchen, bar, dessert).
 * Menu items reference stations by key (items.default_station).
 * Order items store resolved station key in station_override.
 */
export const locationStations = pgTable(
  "location_stations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    /** Stable identifier for routing (e.g. "kitchen", "bar", "dessert"). Unique per location. */
    key: varchar("key", { length: 50 }).notNull(),
    /** Display name (e.g. "Kitchen", "Bar"). */
    name: varchar("name", { length: 100 }).notNull(),
    /** Sort order for KDS station tabs. */
    displayOrder: integer("display_order").notNull().default(0),
    /** If false, station is hidden from KDS and menu assignment. */
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("location_stations_location_id_idx").on(table.locationId),
    index("location_stations_location_id_is_active_idx").on(table.locationId, table.isActive),
    index("location_stations_location_id_display_order_idx").on(table.locationId, table.displayOrder),
    unique("uq_location_stations_location_key").on(table.locationId, table.key),
  ]
);

export type LocationStation = typeof locationStations.$inferSelect;
export type NewLocationStation = typeof locationStations.$inferInsert;
