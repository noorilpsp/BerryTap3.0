-- Add default_substation to items for KDS kitchen lane routing (grill, fryer, cold_prep, etc.).
-- Apply with: npm run db:migrate:0008
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "default_substation" varchar(50);
