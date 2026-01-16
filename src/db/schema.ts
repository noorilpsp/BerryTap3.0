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

export const fastCategories = pgTable(
  "fast_categories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    collection_id: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    collectionIdIdx: index("fast_categories_collection_id_idx").on(
      table.collection_id,
    ),
  }),
);

export type FastCategory = typeof fastCategories.$inferSelect;

export const subcollections = pgTable(
  "subcollections",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category_slug: text("category_slug")
      .notNull()
      .references(() => fastCategories.slug, { onDelete: "cascade" }),
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
  categories: many(fastCategories),
}));

export const fastCategoriesRelations = relations(fastCategories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [fastCategories.collection_id],
    references: [collections.id],
  }),
  subcollections: many(subcollections),
}));

export const subcollectionRelations = relations(
  subcollections,
  ({ one, many }) => ({
    category: one(fastCategories, {
      fields: [subcollections.category_slug],
      references: [fastCategories.slug],
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
// Re-export new merchant schemas from /lib/db/schema
// ============================================================================

export * from "../lib/db/schema";

// Re-export relations from new schema
export {
  merchantsRelations,
  merchantLocationsRelations,
  merchantUsersRelations,
  staffRelations,
  invitationsRelations,
  platformPersonnelRelations,
} from "../lib/db/schema";

// ============================================================================
// Legacy Relations (for users table)
// ============================================================================

// Import new schemas for relations
import {
  merchantUsers,
  platformPersonnel,
  invitations,
  customers,
  orderTimeline,
} from "../lib/db/schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  merchantUsers: many(merchantUsers),
  platformPersonnel: one(platformPersonnel),
  invitations: many(invitations),
  customers: many(customers),
  orderTimelineChanges: many(orderTimeline),
}));
