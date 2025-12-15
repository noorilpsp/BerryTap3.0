CREATE TYPE "public"."business_type" AS ENUM('restaurant', 'cafe', 'bar', 'bakery', 'food_truck', 'other');--> statement-breakpoint
CREATE TYPE "public"."location_status" AS ENUM('coming_soon', 'active', 'temporarily_closed', 'closed');--> statement-breakpoint
CREATE TYPE "public"."merchant_status" AS ENUM('onboarding', 'active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."merchant_user_role" AS ENUM('owner', 'admin', 'manager');--> statement-breakpoint
CREATE TYPE "public"."platform_personnel_role" AS ENUM('super_admin', 'support', 'sales', 'finance', 'onboarding', 'developer');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('cashier', 'kitchen', 'bar', 'server', 'driver', 'cleaner', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"collection_id" integer NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "merchant_user_role" NOT NULL,
	"location_access" jsonb,
	"invited_by" text NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"postal_code" varchar(10) NOT NULL,
	"city" varchar(100) NOT NULL,
	"lat" numeric(10, 8),
	"lng" numeric(11, 8),
	"phone" text NOT NULL,
	"email" text,
	"logo_url" text,
	"banner_url" text,
	"status" "location_status" DEFAULT 'active' NOT NULL,
	"opening_hours" jsonb NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_users" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "merchant_user_role" NOT NULL,
	"location_access" jsonb,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"invited_by" text,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"kbo_number" varchar(20),
	"contact_email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"business_type" "business_type" NOT NULL,
	"status" "merchant_status" DEFAULT 'onboarding' NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'trial' NOT NULL,
	"subscription_expires_at" timestamp with time zone,
	"timezone" varchar(50) DEFAULT 'Europe/Brussels' NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_personnel" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "platform_personnel_role" NOT NULL,
	"department" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric NOT NULL,
	"subcategory_slug" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"location_id" text NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text,
	"phone" text,
	"pin_code_hash" varchar(255) NOT NULL,
	"role" "staff_role" NOT NULL,
	"permissions" jsonb,
	"hourly_wage" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"hired_at" date NOT NULL,
	"terminated_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subcollection_id" integer NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "subcollections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category_slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"locale" varchar(5) DEFAULT 'nl-BE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_locations" ADD CONSTRAINT "merchant_locations_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_personnel" ADD CONSTRAINT "platform_personnel_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_slug_subcategories_slug_fk" FOREIGN KEY ("subcategory_slug") REFERENCES "public"."subcategories"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_location_id_merchant_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."merchant_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_subcollection_id_subcollections_id_fk" FOREIGN KEY ("subcollection_id") REFERENCES "public"."subcollections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcollections" ADD CONSTRAINT "subcollections_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_collection_id_idx" ON "categories" USING btree ("collection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_unique" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_merchant_id_expires_at_idx" ON "invitations" USING btree ("merchant_id","expires_at");--> statement-breakpoint
CREATE INDEX "merchant_locations_merchant_id_idx" ON "merchant_locations" USING btree ("merchant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "merchant_users_merchant_id_user_id_unique" ON "merchant_users" USING btree ("merchant_id","user_id");--> statement-breakpoint
CREATE INDEX "merchant_users_merchant_id_idx" ON "merchant_users" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "merchant_users_user_id_idx" ON "merchant_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "name_search_index" ON "products" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX CONCURRENTLY "name_trgm_index" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_subcategory_slug_idx" ON "products" USING btree ("subcategory_slug");--> statement-breakpoint
CREATE INDEX "staff_location_id_idx" ON "staff" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "staff_is_active_idx" ON "staff" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "subcategories_subcollection_id_idx" ON "subcategories" USING btree ("subcollection_id");--> statement-breakpoint
CREATE INDEX "subcollections_category_slug_idx" ON "subcollections" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");