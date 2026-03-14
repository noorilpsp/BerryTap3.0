-- Guest CRM enrichment: birthday, anniversary, profile_meta, customer_notes.
-- Apply with: npm run db:migrate:0012

-- Add CRM columns to customers
ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "birthday" date,
  ADD COLUMN IF NOT EXISTS "anniversary" date,
  ADD COLUMN IF NOT EXISTS "profile_meta" jsonb;

-- Create customer_notes table for staff notes
CREATE TABLE IF NOT EXISTS "customer_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "staff_id" uuid REFERENCES "staff"("id") ON DELETE SET NULL,
  "author_name" varchar(255),
  "role" varchar(50),
  "text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "customer_notes_customer_id_idx" ON "customer_notes" ("customer_id");
