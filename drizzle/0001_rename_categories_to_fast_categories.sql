-- Rename table from categories to fast_categories
ALTER TABLE "categories" RENAME TO "fast_categories";--> statement-breakpoint

-- Rename index from categories_collection_id_idx to fast_categories_collection_id_idx
ALTER INDEX "categories_collection_id_idx" RENAME TO "fast_categories_collection_id_idx";--> statement-breakpoint

-- Rename foreign key constraint (if it exists with the old name pattern)
-- Note: PostgreSQL automatically updates foreign key constraint names when tables are renamed,
-- but we'll explicitly rename it for clarity
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_collection_id_collections_id_fk'
  ) THEN
    ALTER TABLE "fast_categories" 
    RENAME CONSTRAINT "categories_collection_id_collections_id_fk" 
    TO "fast_categories_collection_id_collections_id_fk";
  END IF;
END $$;--> statement-breakpoint

-- Rename foreign key constraint on subcollections table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subcollections_category_slug_categories_slug_fk'
  ) THEN
    ALTER TABLE "subcollections" 
    RENAME CONSTRAINT "subcollections_category_slug_categories_slug_fk" 
    TO "subcollections_category_slug_fast_categories_slug_fk";
  END IF;
END $$;
