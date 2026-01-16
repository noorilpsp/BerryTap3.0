const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  }
});

const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL or DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    console.log('📋 Applying migration: Rename categories to fast_categories...\n');
    
    const migrationFile = path.join(__dirname, 'drizzle', '0001_rename_categories_to_fast_categories.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await client.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (err) {
          // Some statements might fail if constraints don't exist with exact names
          // This is okay - PostgreSQL handles most renames automatically
          if (err.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1} skipped (constraint/index may have been auto-renamed): ${err.message.split('\n')[0]}`);
          } else {
            throw err;
          }
        }
      }
    }
    
    // Verify the migration
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'fast_categories'
    `);
    
    if (result.rows.length > 0) {
      console.log('\n✅ Migration applied successfully!');
      console.log('✅ Table "fast_categories" exists');
      
      // Check if old table still exists
      const oldTable = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      `);
      
      if (oldTable.rows.length > 0) {
        console.log('⚠️  Warning: Old "categories" table still exists');
      } else {
        console.log('✅ Old "categories" table has been renamed');
      }
    } else {
      console.log('\n❌ Migration may have failed - fast_categories table not found');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    await client.end();
    process.exit(1);
  }
})();
