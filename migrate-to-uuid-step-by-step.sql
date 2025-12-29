-- Migration script to convert ID columns from text/varchar to UUID
-- Run each section separately in Neon SQL editor if you get errors

-- ============================================================================
-- STEP 1: Drop foreign key constraints
-- ============================================================================

-- Drop constraints on merchant_users
ALTER TABLE IF EXISTS merchant_users DROP CONSTRAINT IF EXISTS merchant_users_merchant_id_fkey;
ALTER TABLE IF EXISTS merchant_users DROP CONSTRAINT IF EXISTS merchant_users_user_id_users_id_fk;
ALTER TABLE IF EXISTS merchant_users DROP CONSTRAINT IF EXISTS merchant_users_invited_by_users_id_fk;

-- Drop constraints on invitations
ALTER TABLE IF EXISTS invitations DROP CONSTRAINT IF EXISTS invitations_merchant_id_fkey;
ALTER TABLE IF EXISTS invitations DROP CONSTRAINT IF EXISTS invitations_invited_by_users_id_fk;

-- Drop constraints on platform_personnel
ALTER TABLE IF EXISTS platform_personnel DROP CONSTRAINT IF EXISTS platform_personnel_user_id_users_id_fk;

-- Drop constraints on staff
ALTER TABLE IF EXISTS staff DROP CONSTRAINT IF EXISTS staff_location_id_fkey;

-- Drop constraints on merchant_locations
ALTER TABLE IF EXISTS merchant_locations DROP CONSTRAINT IF EXISTS merchant_locations_merchant_id_fkey;

-- ============================================================================
-- STEP 2: Convert merchants table
-- ============================================================================

ALTER TABLE merchants ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchants ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- STEP 3: Convert merchant_locations table
-- ============================================================================

ALTER TABLE merchant_locations ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchant_locations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE merchant_locations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;

-- ============================================================================
-- STEP 4: Convert merchant_users table
-- ============================================================================

ALTER TABLE merchant_users ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchant_users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE merchant_users ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;
ALTER TABLE merchant_users ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE merchant_users ALTER COLUMN invited_by TYPE uuid USING NULLIF(invited_by, '')::uuid;

-- ============================================================================
-- STEP 5: Convert invitations table
-- ============================================================================

ALTER TABLE invitations ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE invitations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invitations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;
ALTER TABLE invitations ALTER COLUMN invited_by TYPE uuid USING invited_by::uuid;

-- ============================================================================
-- STEP 6: Convert staff table
-- ============================================================================

ALTER TABLE staff ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE staff ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE staff ALTER COLUMN location_id TYPE uuid USING location_id::uuid;

-- ============================================================================
-- STEP 7: Convert platform_personnel table
-- ============================================================================

ALTER TABLE platform_personnel ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- ============================================================================
-- STEP 8: Verify the changes (optional)
-- ============================================================================

SELECT 
  table_name, 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name IN ('merchants', 'merchant_locations', 'merchant_users', 'invitations', 'staff', 'platform_personnel')
  AND column_name IN ('id', 'merchant_id', 'user_id', 'invited_by', 'location_id')
ORDER BY table_name, column_name;


