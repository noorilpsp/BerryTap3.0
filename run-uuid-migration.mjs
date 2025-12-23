#!/usr/bin/env node
/**
 * Migration script to convert ID columns to UUID
 * Run with: node run-uuid-migration.mjs
 */

import pg from "pg";
const { Client } = pg;
import pkg from "@next/env";
const { loadEnvConfig } = pkg;

// Load environment variables
loadEnvConfig(process.cwd());

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: POSTGRES_URL or DATABASE_URL not found in environment");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

// First, get all foreign key constraints and drop them
const dropConstraints = [
  // Drop all foreign key constraints that reference the tables we're modifying
  `DO $$ 
  DECLARE
    r RECORD;
  BEGIN
    FOR r IN (SELECT constraint_name, table_name 
              FROM information_schema.table_constraints 
              WHERE constraint_type = 'FOREIGN KEY' 
              AND (table_name IN ('merchants', 'merchant_locations', 'merchant_users', 'invitations', 'staff', 'platform_personnel')
                   OR constraint_name LIKE '%merchant%' 
                   OR constraint_name LIKE '%location%'
                   OR constraint_name LIKE '%user%'
                   OR constraint_name LIKE '%invitation%'
                   OR constraint_name LIKE '%staff%'))
    LOOP
      EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
  END $$;`,
];

const statements = [
  // Merchants
  `ALTER TABLE merchants ALTER COLUMN id TYPE uuid USING id::uuid`,
  `ALTER TABLE merchants ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
  
  // Merchant locations
  `ALTER TABLE merchant_locations ALTER COLUMN id TYPE uuid USING id::uuid`,
  `ALTER TABLE merchant_locations ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
  `ALTER TABLE merchant_locations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid`,
  
  // Merchant users
  `ALTER TABLE merchant_users ALTER COLUMN id TYPE uuid USING id::uuid`,
  `ALTER TABLE merchant_users ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
  `ALTER TABLE merchant_users ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid`,
  `ALTER TABLE merchant_users ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,
  `ALTER TABLE merchant_users ALTER COLUMN invited_by TYPE uuid USING NULLIF(invited_by, '')::uuid`,
  
  // Invitations
  `ALTER TABLE invitations ALTER COLUMN id TYPE uuid USING id::uuid`,
  `ALTER TABLE invitations ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
  `ALTER TABLE invitations ALTER COLUMN merchant_id TYPE uuid USING merchant_id::uuid`,
  `ALTER TABLE invitations ALTER COLUMN invited_by TYPE uuid USING invited_by::uuid`,
  
  // Staff
  `ALTER TABLE staff ALTER COLUMN id TYPE uuid USING id::uuid`,
  `ALTER TABLE staff ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
  `ALTER TABLE staff ALTER COLUMN location_id TYPE uuid USING location_id::uuid`,
  
  // Platform personnel
  `ALTER TABLE platform_personnel ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,
];

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to database\n");
    
    // Step 1: Drop all foreign key constraints
    console.log("Step 1: Dropping foreign key constraints...\n");
    for (let i = 0; i < dropConstraints.length; i++) {
      const statement = dropConstraints[i];
      try {
        console.log(`Dropping constraints...`);
        await client.query(statement);
        console.log(`✓ Constraints dropped\n`);
      } catch (error) {
        console.error(`✗ Error dropping constraints: ${error.message}`);
        throw error;
      }
    }
    
    // Step 2: Convert column types
    console.log("Step 2: Converting ID columns to UUID...\n");
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
        await client.query(statement);
        console.log(`✓ Success\n`);
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
        console.error(`Statement: ${statement}\n`);
        throw error;
      }
    }
    
    console.log("✓ Migration completed successfully!");
    console.log("\nYou can now run: npm run db:push");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

