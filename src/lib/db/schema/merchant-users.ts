import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { merchants } from "./merchants";

/**
 * Merchant user role enum
 */
export const merchantUserRoleEnum = pgEnum("merchant_user_role", [
  "owner",
  "admin",
  "manager",
]);

/**
 * Location access JSONB structure:
 * Array of location UUIDs: ["location-uuid-1", "location-uuid-2"]
 * NULL or empty array = access to all locations
 */
export type LocationAccess = string[];

/**
 * Permissions JSONB structure:
 * {
 *   "can_void_orders": boolean,
 *   "can_apply_discounts": boolean,
 *   "can_manage_tables": boolean,
 *   "can_refund": boolean,
 *   ...other permissions
 * }
 */
export type MerchantUserPermissions = {
  [key: string]: boolean;
};

/**
 * Merchant users table
 * Links users (from auth.users) to merchants with roles and permissions
 * Note: user_id references auth.users.id (Supabase auth table)
 */
export const merchantUsers = pgTable(
  "merchant_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Foreign Keys
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    // Note: user_id references auth.users.id (Supabase auth table)
    // We can't create a foreign key to auth.users in Drizzle, but we document it
    userId: uuid("user_id").notNull(), // Foreign Key → auth.users.id, ON DELETE CASCADE
    invitedBy: uuid("invited_by"), // Foreign Key → auth.users.id, ON DELETE SET NULL
    // Role & Access
    role: merchantUserRoleEnum("role").notNull(),
    locationAccess: jsonb("location_access").$type<LocationAccess>(),
    permissions: jsonb("permissions").$type<MerchantUserPermissions>(),
    isActive: boolean("is_active").default(true).notNull(),
    // Invitation Tracking
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    merchantIdUserIdUnique: uniqueIndex(
      "merchant_users_merchant_id_user_id_unique",
    ).on(table.merchantId, table.userId),
    merchantIdIdx: index("merchant_users_merchant_id_idx").on(
      table.merchantId,
    ),
    userIdIdx: index("merchant_users_user_id_idx").on(table.userId),
    isActiveIdx: index("merchant_users_is_active_idx").on(table.isActive),
  }),
);

export type MerchantUser = typeof merchantUsers.$inferSelect;
export type NewMerchantUser = typeof merchantUsers.$inferInsert;


