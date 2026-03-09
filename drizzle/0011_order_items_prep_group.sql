-- Add prep_group to order_items for split work-groups (KDS v1).
-- null = main; non-null = split group.
-- Apply with: npm run db:migrate:0011
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "prep_group" varchar(50);
