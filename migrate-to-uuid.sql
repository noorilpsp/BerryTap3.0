-- Migration script to convert ID columns from text/varchar to UUID
-- Run this in your Neon database SQL editor before running npm run db:push

-- Note: pgcrypto extension should already be enabled in Neon
-- If you get an error, skip this line and continue
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop foreign key constraints that might block the type change
-- (These will be recreated by drizzle-kit push)

-- Drop constraints on merchant_users
ALTER TABLE IF EXISTS merchant_users 
  DROP CONSTRAINT IF EXISTS merchant_users_merchant_id_fkey,
  DROP CONSTRAINT IF EXISTS merchant_users_user_id_users_id_fk,
  DROP CONSTRAINT IF EXISTS merchant_users_invited_by_users_id_fk;

-- Drop constraints on invitations
ALTER TABLE IF EXISTS invitations 
  DROP CONSTRAINT IF EXISTS invitations_merchant_id_fkey,
  DROP CONSTRAINT IF EXISTS invitations_invited_by_users_id_fk;

-- Drop constraints on platform_personnel
ALTER TABLE IF EXISTS platform_personnel 
  DROP CONSTRAINT IF EXISTS platform_personnel_user_id_users_id_fk;

-- Drop constraints on staff
ALTER TABLE IF EXISTS staff 
  DROP CONSTRAINT IF EXISTS staff_location_id_fkey;

-- Drop constraints on merchant_locations
ALTER TABLE IF EXISTS merchant_locations 
  DROP CONSTRAINT IF EXISTS merchant_locations_merchant_id_fkey;

-- Convert merchants table
ALTER TABLE merchants 
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Convert merchant_locations table
ALTER TABLE merchant_locations 
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;

-- Convert merchant_users table
ALTER TABLE merchant_users 
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid,
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ALTER COLUMN invited_by TYPE uuid USING NULLIF(invited_by, '')::uuid;

-- Convert invitations table
ALTER TABLE invitations 
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid,
  ALTER COLUMN invited_by TYPE uuid USING invited_by::uuid;

-- Convert staff table
ALTER TABLE staff 
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN location_id TYPE uuid USING location_id::uuid;

-- Convert platform_personnel table
ALTER TABLE platform_personnel 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name IN ('merchants', 'merchant_locations', 'merchant_users', 'invitations', 'staff', 'platform_personnel')
  AND column_name IN ('id', 'merchant_id', 'user_id', 'invited_by', 'location_id')
ORDER BY table_name, column_name;

