-- Add default_station to items for KDS routing.
-- Apply with: npm run db:migrate:0006
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "default_station" varchar(50);
