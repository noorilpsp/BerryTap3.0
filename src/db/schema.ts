import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export type Collection = typeof collections.$inferSelect;

export const categories = pgTable(
  "categories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    collection_id: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    collectionIdIdx: index("categories_collection_id_idx").on(
      table.collection_id,
    ),
  }),
);

export type Category = typeof categories.$inferSelect;

export const subcollections = pgTable(
  "subcollections",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category_slug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onDelete: "cascade" }),
  },
  (table) => ({
    categorySlugIdx: index("subcollections_category_slug_idx").on(
      table.category_slug,
    ),
  }),
);

export type Subcollection = typeof subcollections.$inferSelect;

export const subcategories = pgTable(
  "subcategories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    subcollection_id: integer("subcollection_id")
      .notNull()
      .references(() => subcollections.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    subcollectionIdIdx: index("subcategories_subcollection_id_idx").on(
      table.subcollection_id,
    ),
  }),
);

export type Subcategory = typeof subcategories.$inferSelect;

export const products = pgTable(
  "products",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: numeric("price").notNull(),
    subcategory_slug: text("subcategory_slug")
      .notNull()
      .references(() => subcategories.slug, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    nameSearchIndex: index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
    nameTrgmIndex: index("name_trgm_index")
      .using("gin", sql`${table.name} gin_trgm_ops`)
      .concurrently(),
    subcategorySlugIdx: index("products_subcategory_slug_idx").on(
      table.subcategory_slug,
    ),
  }),
);

export type Product = typeof products.$inferSelect;

export const collectionsRelations = relations(collections, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [categories.collection_id],
    references: [collections.id],
  }),
  subcollections: many(subcollections),
}));

export const subcollectionRelations = relations(
  subcollections,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcollections.category_slug],
      references: [categories.slug],
    }),
    subcategories: many(subcategories),
  }),
);

export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    subcollection: one(subcollections, {
      fields: [subcategories.subcollection_id],
      references: [subcollections.id],
    }),
    products: many(products),
  }),
);

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategory_slug],
    references: [subcategories.slug],
  }),
}));

// ============================================================================
// BerryTap Tables - Users & Authentication
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Supabase auth user id (UUID string)
    email: text("email").notNull(),
    phone: text("phone"),
    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    locale: varchar("locale", { length: 5 }).default("nl-BE").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ============================================================================
// BerryTap Tables - Merchants
// ============================================================================

export const businessTypeEnum = pgEnum("business_type", [
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "food_truck",
  "other",
]);

export const merchantStatusEnum = pgEnum("merchant_status", [
  "onboarding",
  "active",
  "suspended",
  "inactive",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "trial",
  "basic",
  "pro",
  "enterprise",
]);

export const merchants = pgTable("merchants", {
  id: text("id").primaryKey(), // UUID
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  kboNumber: varchar("kbo_number", { length: 20 }),
  contactEmail: text("contact_email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  businessType: businessTypeEnum("business_type").notNull(),
  status: merchantStatusEnum("status").default("onboarding").notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("trial")
    .notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    withTimezone: true,
  }),
  timezone: varchar("timezone", { length: 50 })
    .default("Europe/Brussels")
    .notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;

// ============================================================================
// BerryTap Tables - Merchant Users
// ============================================================================

export const merchantUserRoleEnum = pgEnum("merchant_user_role", [
  "owner",
  "admin",
  "manager",
]);

export const merchantUsers = pgTable(
  "merchant_users",
  {
    id: text("id").primaryKey(), // UUID
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: merchantUserRoleEnum("role").notNull(),
    locationAccess: jsonb("location_access").$type<string[]>(),
    permissions: jsonb("permissions").$type<Record<string, boolean>>(),
    isActive: boolean("is_active").default(true).notNull(),
    invitedBy: text("invited_by").references(() => users.id),
    invitedAt: timestamp("invited_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    merchantUserUnique: uniqueIndex("merchant_users_merchant_id_user_id_unique").on(
      table.merchantId,
      table.userId,
    ),
    merchantIdIdx: index("merchant_users_merchant_id_idx").on(table.merchantId),
    userIdIdx: index("merchant_users_user_id_idx").on(table.userId),
  }),
);

export type MerchantUser = typeof merchantUsers.$inferSelect;
export type NewMerchantUser = typeof merchantUsers.$inferInsert;

// ============================================================================
// BerryTap Tables - Merchant Locations
// ============================================================================

export const locationStatusEnum = pgEnum("location_status", [
  "coming_soon",
  "active",
  "temporarily_closed",
  "closed",
]);

export const merchantLocations = pgTable(
  "merchant_locations",
  {
    id: text("id").primaryKey(), // UUID
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address").notNull(),
    postalCode: varchar("postal_code", { length: 10 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    lat: decimal("lat", { precision: 10, scale: 8 }),
    lng: decimal("lng", { precision: 11, scale: 8 }),
    phone: text("phone").notNull(),
    email: text("email"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    status: locationStatusEnum("status").default("active").notNull(),
    openingHours: jsonb("opening_hours").notNull(),
    settings: jsonb("settings").$type<{
      tax_rate?: number;
      service_charge_percentage?: number;
      accepts_cash?: boolean;
      accepts_cards?: boolean;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    merchantIdIdx: index("merchant_locations_merchant_id_idx").on(
      table.merchantId,
    ),
  }),
);

export type MerchantLocation = typeof merchantLocations.$inferSelect;
export type NewMerchantLocation = typeof merchantLocations.$inferInsert;

// ============================================================================
// BerryTap Tables - Staff
// ============================================================================

export const staffRoleEnum = pgEnum("staff_role", [
  "cashier",
  "kitchen",
  "bar",
  "server",
  "driver",
  "cleaner",
  "other",
]);

export const staff = pgTable(
  "staff",
  {
    id: text("id").primaryKey(), // UUID
    locationId: text("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: text("email"),
    phone: text("phone"),
    pinCodeHash: varchar("pin_code_hash", { length: 255 }).notNull(),
    role: staffRoleEnum("role").notNull(),
    permissions: jsonb("permissions").$type<{
      can_void_orders?: boolean;
      can_apply_discounts?: boolean;
      can_manage_tables?: boolean;
    }>(),
    hourlyWage: decimal("hourly_wage", { precision: 10, scale: 2 }),
    isActive: boolean("is_active").default(true).notNull(),
    hiredAt: date("hired_at").notNull(),
    terminatedAt: date("terminated_at"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    locationIdIdx: index("staff_location_id_idx").on(table.locationId),
    isActiveIdx: index("staff_is_active_idx").on(table.isActive),
  }),
);

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;

// ============================================================================
// BerryTap Tables - Platform Personnel
// ============================================================================

export const platformPersonnelRoleEnum = pgEnum("platform_personnel_role", [
  "super_admin",
  "support",
  "sales",
  "finance",
  "onboarding",
  "developer",
]);

export const platformPersonnel = pgTable("platform_personnel", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  role: platformPersonnelRoleEnum("role").notNull(),
  department: varchar("department", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PlatformPersonnel = typeof platformPersonnel.$inferSelect;
export type NewPlatformPersonnel = typeof platformPersonnel.$inferInsert;

// ============================================================================
// BerryTap Tables - Invitations
// ============================================================================

export const invitations = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(), // UUID
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: merchantUserRoleEnum("role").notNull(),
    locationAccess: jsonb("location_access").$type<string[]>(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => users.id),
    token: varchar("token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("invitations_token_unique").on(table.token),
    emailIdx: index("invitations_email_idx").on(table.email),
    merchantIdExpiresAtIdx: index("invitations_merchant_id_expires_at_idx").on(
      table.merchantId,
      table.expiresAt,
    ),
  }),
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// ============================================================================
// BerryTap Relations
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  merchantUsers: many(merchantUsers),
  platformPersonnel: one(platformPersonnel),
  invitations: many(invitations),
}));

export const merchantsRelations = relations(merchants, ({ many }) => ({
  merchantUsers: many(merchantUsers),
  locations: many(merchantLocations),
  invitations: many(invitations),
}));

export const merchantUsersRelations = relations(merchantUsers, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantUsers.merchantId],
    references: [merchants.id],
  }),
  user: one(users, {
    fields: [merchantUsers.userId],
    references: [users.id],
  }),
  invitedByUser: one(users, {
    fields: [merchantUsers.invitedBy],
    references: [users.id],
    relationName: "invitedBy",
  }),
}));

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

export const staffRelations = relations(staff, ({ one }) => ({
  location: one(merchantLocations, {
    fields: [staff.locationId],
    references: [merchantLocations.id],
  }),
}));

export const platformPersonnelRelations = relations(
  platformPersonnel,
  ({ one }) => ({
    user: one(users, {
      fields: [platformPersonnel.userId],
      references: [users.id],
    }),
  }),
);

export const invitationsRelations = relations(invitations, ({ one }) => ({
  merchant: one(merchants, {
    fields: [invitations.merchantId],
    references: [merchants.id],
  }),
  invitedByUser: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));
