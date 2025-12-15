import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local manually
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL or DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('📦 Reading data-small.sql...');
const sqlFile = join(__dirname, 'data', 'data-small.sql');
const sql = readFileSync(sqlFile, 'utf8');

console.log('🔌 Connecting to Neon database...');
const client = new Client({ connectionString });

try {
  await client.connect();
  console.log('✅ Connected to database');
  
  console.log('📥 Importing data...');
  await client.query(sql);
  
  console.log('✅ Data import completed successfully!');
  console.log('📊 Your database now has:');
  console.log('   - Collections, Categories, Subcollections, Subcategories, Products');
  
  await client.end();
} catch (error) {
  console.error('❌ Error importing data:', error.message);
  await client.end();
  process.exit(1);
}

