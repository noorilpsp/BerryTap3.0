import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Platform personnel role enum
 */
export const platformPersonnelRoleEnum = pgEnum("platform_personnel_role", [
  "super_admin",
  "support",
  "sales",
  "finance",
  "onboarding",
  "developer",
]);

/**
 * Platform personnel table
 * Stores platform staff/admin users
 * Note: user_id references auth.users.id (Supabase auth table) and is the primary key
 */
export const platformPersonnel = pgTable("platform_personnel", {
  // Primary Key (also Foreign Key → auth.users.id)
  // Note: We can't create a foreign key to auth.users in Drizzle, but we document it
  userId: uuid("user_id").primaryKey(), // Foreign Key → auth.users.id, ON DELETE CASCADE
  // Role & Department
  role: platformPersonnelRoleEnum("role").notNull(),
  department: varchar("department", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  // Activity
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PlatformPersonnel = typeof platformPersonnel.$inferSelect;
export type NewPlatformPersonnel = typeof platformPersonnel.$inferInsert;

