import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { merchantLocations } from "./merchant-locations";

// =============================================================================
// FLOOR PLANS
// =============================================================================

export const floorPlans = pgTable(
  "floor_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    elements: jsonb("elements").notNull(),
    sections: jsonb("sections").$type<{ id: string; name: string }[]>(),
    gridSize: integer("grid_size").notNull(),
    totalSeats: integer("total_seats").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    locationIdIdx: index("floor_plans_location_id_idx").on(table.locationId),
    isActiveIdx: index("floor_plans_is_active_idx").on(table.isActive),
    locationActiveIdx: index("floor_plans_location_active_idx").on(
      table.locationId,
      table.isActive,
    ),
  }),
);

export const floorPlansRelations = relations(floorPlans, ({ one }) => ({
  location: one(merchantLocations, {
    fields: [floorPlans.locationId],
    references: [merchantLocations.id],
  }),
}));

export type FloorPlan = typeof floorPlans.$inferSelect;
export type NewFloorPlan = typeof floorPlans.$inferInsert;
