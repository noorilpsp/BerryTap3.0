-- Run these ALTER TABLE statements one at a time in Neon SQL editor
-- Start with merchants table

-- 1. Convert merchants table
ALTER TABLE merchants ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchants ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Convert merchant_locations table  
ALTER TABLE merchant_locations ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchant_locations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE merchant_locations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;

-- 3. Convert merchant_users table
ALTER TABLE merchant_users ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE merchant_users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE merchant_users ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;
ALTER TABLE merchant_users ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE merchant_users ALTER COLUMN invited_by TYPE uuid USING NULLIF(invited_by, '')::uuid;

-- 4. Convert invitations table
ALTER TABLE invitations ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE invitations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invitations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid;
ALTER TABLE invitations ALTER COLUMN invited_by TYPE uuid USING invited_by::uuid;

-- 5. Convert staff table
ALTER TABLE staff ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE staff ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE staff ALTER COLUMN location_id TYPE uuid USING location_id::uuid;

-- 6. Convert platform_personnel table
ALTER TABLE platform_personnel ALTER COLUMN user_id TYPE uuid USING user_id::uuid;


