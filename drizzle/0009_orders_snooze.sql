-- Add KDS snooze fields to orders.
-- Apply with: npm run db:migrate:0009
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "snoozed_at" timestamp with time zone;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "snooze_until" timestamp with time zone;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "was_snoozed" boolean DEFAULT false;
