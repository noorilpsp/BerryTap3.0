/**
 * Drizzle ORM Schema Index
 * 
 * This file exports all table schemas and their relations.
 * 
 * Database: Neon Postgres (serverless)
 * ORM: Drizzle ORM
 * Framework: Next.js 16
 * Auth: Supabase (auth.users table already exists)
 * 
 * Note: Foreign keys to auth.users (Supabase auth table) are documented
 * but cannot be created in Drizzle as auth.users is managed by Supabase.
 */

import { relations } from "drizzle-orm";

// Export all tables
export * from "./merchants";
export * from "./merchant-locations";
export * from "./merchant-users";
export * from "./staff";
export * from "./invitations";
export * from "./platform-personnel";

// Import tables for relations
import { merchants } from "./merchants";
import { merchantLocations } from "./merchant-locations";
import { merchantUsers } from "./merchant-users";
import { staff } from "./staff";
import { invitations } from "./invitations";
import { platformPersonnel } from "./platform-personnel";

// ============================================================================
// Relations
// ============================================================================

/**
 * Merchants relations
 * - One merchant has many locations
 * - One merchant has many merchant users
 * - One merchant has many invitations
 */
export const merchantsRelations = relations(merchants, ({ many }) => ({
  locations: many(merchantLocations),
  merchantUsers: many(merchantUsers),
  invitations: many(invitations),
}));

/**
 * Merchant locations relations
 * - Many locations belong to one merchant
 * - One location has many staff members
 */
export const merchantLocationsRelations = relations(
  merchantLocations,
  ({ one, many }) => ({
    merchant: one(merchants, {
      fields: [merchantLocations.merchantId],
      references: [merchants.id],
    }),
    staff: many(staff),
  }),
);

/**
 * Merchant users relations
 * - Many merchant users belong to one merchant
 * - One merchant user belongs to one user (auth.users)
 * - One merchant user can be invited by one user (auth.users)
 * 
 * Note: user_id and invited_by reference auth.users.id which is managed by Supabase
 */
export const merchantUsersRelations = relations(merchantUsers, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantUsers.merchantId],
    references: [merchants.id],
  }),
  // Note: user relation would reference auth.users.id
  // This is documented but not implemented as auth.users is managed by Supabase
}));

/**
 * Staff relations
 * - Many staff members belong to one location
 */
export const staffRelations = relations(staff, ({ one }) => ({
  location: one(merchantLocations, {
    fields: [staff.locationId],
    references: [merchantLocations.id],
  }),
}));

/**
 * Invitations relations
 * - Many invitations belong to one merchant
 * - One invitation is created by one user (auth.users)
 * 
 * Note: invited_by references auth.users.id which is managed by Supabase
 */
export const invitationsRelations = relations(invitations, ({ one }) => ({
  merchant: one(merchants, {
    fields: [invitations.merchantId],
    references: [merchants.id],
  }),
  // Note: invitedBy relation would reference auth.users.id
  // This is documented but not implemented as auth.users is managed by Supabase
}));

/**
 * Platform personnel relations
 * - One platform personnel entry belongs to one user (auth.users)
 * 
 * Note: user_id references auth.users.id which is managed by Supabase
 */
export const platformPersonnelRelations = relations(
  platformPersonnel,
  ({ one }) => ({
    // Note: user relation would reference auth.users.id
    // This is documented but not implemented as auth.users is managed by Supabase
  }),
);


