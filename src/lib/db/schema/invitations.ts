import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { merchants } from "./merchants";
import { merchantUserRoleEnum } from "./merchant-users";

/**
 * Location access JSONB structure:
 * Array of location UUIDs: ["location-uuid-1", "location-uuid-2"]
 * NULL or empty array = access to all locations
 */
export type InvitationLocationAccess = string[];

/**
 * Invitations table
 * Stores pending invitations for users to join merchants
 * Note: invited_by references auth.users.id (Supabase auth table)
 */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Foreign Keys
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    // Note: invited_by references auth.users.id (Supabase auth table)
    // We can't create a foreign key to auth.users in Drizzle, but we document it
    invitedBy: uuid("invited_by").notNull(), // Foreign Key → auth.users.id, ON DELETE SET NULL
    // Invitation Details
    email: varchar("email", { length: 255 }).notNull(),
    role: merchantUserRoleEnum("role").notNull(),
    locationAccess: jsonb("location_access").$type<InvitationLocationAccess>(),
    token: varchar("token", { length: 255 }).notNull(),
    // Lifecycle
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("invitations_token_idx").on(table.token),
    emailIdx: index("invitations_email_idx").on(table.email),
    merchantIdExpiresAtIdx: index(
      "invitations_merchant_id_expires_at_idx",
    ).on(table.merchantId, table.expiresAt),
  }),
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;


