import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

/**
 * Business type enum for merchants
 */
export const businessTypeEnum = pgEnum("business_type", [
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "food_truck",
  "fine_dining",
  "fast_food",
  "other",
]);

/**
 * Merchant status enum
 */
export const merchantStatusEnum = pgEnum("merchant_status", [
  "onboarding",
  "active",
  "suspended",
  "inactive",
]);

/**
 * Subscription tier enum
 */
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "trial",
  "basic",
  "pro",
  "enterprise",
]);

/**
 * Notification preferences JSONB structure:
 * {
 *   "order_notifications": boolean,
 *   "marketing_emails": boolean,
 *   "system_updates": boolean,
 *   "weekly_reports": boolean
 * }
 */
export type NotificationPreferences = {
  order_notifications?: boolean;
  marketing_emails?: boolean;
  system_updates?: boolean;
  weekly_reports?: boolean;
};

/**
 * Merchants table
 * Stores merchant/business information including legal details, branding, and subscription data
 */
export const merchants = pgTable(
  "merchants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Identity & Contact
    name: varchar("name", { length: 255 }).notNull(),
    publicBrandName: varchar("public_brand_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
    // Legal & Tax
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    vatNumber: varchar("vat_number", { length: 50 }),
    registeredAddressLine1: varchar("registered_address_line1", {
      length: 255,
    }),
    registeredAddressLine2: varchar("registered_address_line2", {
      length: 255,
    }),
    registeredPostalCode: varchar("registered_postal_code", { length: 20 }),
    registeredCity: varchar("registered_city", { length: 100 }),
    registeredCountry: varchar("registered_country", { length: 100 }).default(
      "Belgium",
    ),
    kboNumber: varchar("kbo_number", { length: 50 }),
    // Business Configuration
    businessType: businessTypeEnum("business_type").notNull(),
    status: merchantStatusEnum("status").default("onboarding").notNull(),
    subscriptionTier: subscriptionTierEnum("subscription_tier")
      .default("trial")
      .notNull(),
    subscriptionExpiresAt: timestamp("subscription_expires_at", {
      withTimezone: true,
    }),
    // Branding
    logoUrl: varchar("logo_url", { length: 500 }),
    bannerUrl: varchar("banner_url", { length: 500 }),
    primaryBrandColor: varchar("primary_brand_color", { length: 7 }),
    accentColor: varchar("accent_color", { length: 7 }),
    // Localization & Preferences
    defaultCurrency: varchar("default_currency", { length: 3 })
      .default("EUR")
      .notNull(),
    defaultTimezone: varchar("default_timezone", { length: 50 })
      .default("Europe/Brussels")
      .notNull(),
    defaultLanguage: varchar("default_language", { length: 5 })
      .default("nl-BE")
      .notNull(),
    dateFormat: varchar("date_format", { length: 20 }),
    numberFormat: varchar("number_format", { length: 20 }),
    // Notifications
    billingEmail: varchar("billing_email", { length: 255 }),
    criticalAlertsEmail: varchar("critical_alerts_email", { length: 255 }),
    notificationPreferences: jsonb("notification_preferences").$type<NotificationPreferences>(),
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    statusIdx: index("merchants_status_idx").on(table.status),
    subscriptionTierIdx: index("merchants_subscription_tier_idx").on(
      table.subscriptionTier,
    ),
    contactEmailIdx: index("merchants_contact_email_idx").on(
      table.contactEmail,
    ),
  }),
);

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;


