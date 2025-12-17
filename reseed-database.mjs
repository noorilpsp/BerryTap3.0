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

console.log('🔌 Connecting to Neon database...');
const client = new Client({ connectionString });

// Test connection
try {
  await client.connect();
  console.log('✅ Connected to database\n');
} catch (error) {
  console.error('❌ Failed to connect to database:', error.message);
  process.exit(1);
}

// Step 1: Drop only product-related tables (keep users and merchant tables)
console.log('🗑️  Dropping product-related tables...');
const dropStatements = [
  'DROP TABLE IF EXISTS public.products CASCADE;',
  'DROP TABLE IF EXISTS public.subcategories CASCADE;',
  'DROP TABLE IF EXISTS public.categories CASCADE;',
  'DROP TABLE IF EXISTS public.subcollections CASCADE;',
  'DROP TABLE IF EXISTS public.collections CASCADE;',
  'DROP SEQUENCE IF EXISTS public.collections_id_seq CASCADE;',
  'DROP SEQUENCE IF EXISTS public.subcollections_id_seq CASCADE;',
  'DROP EXTENSION IF EXISTS pg_trgm CASCADE;',
];

for (const statement of dropStatements) {
  try {
    await client.query(statement);
  } catch (error) {
    // Ignore errors for things that don't exist
    if (!error.message.includes('does not exist')) {
      console.warn(`   ⚠️  Warning: ${error.message.substring(0, 80)}`);
    }
  }
}
console.log('✅ Tables dropped\n');

// Step 2: Read and execute the SQL file
console.log('📦 Reading data-small.sql...');
const sqlFile = join(__dirname, 'data', 'data-small.sql');
const sql = readFileSync(sqlFile, 'utf8');

// Parse SQL and convert COPY statements to INSERT statements
const lines = sql.split('\n');
let currentStatement = '';
let inCopy = false;
let copyTable = null;
let copyColumns = null;
let copyData = [];
const statements = [];

function escapeValue(value) {
  if (value === null || value === 'NULL') return 'NULL';
  // Escape single quotes by doubling them
  return `'${String(value).replace(/'/g, "''")}'`;
}

for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed.startsWith('COPY ')) {
    // Parse COPY statement: COPY public.table (col1, col2) FROM stdin;
    const copyMatch = trimmed.match(/COPY\s+(\S+)\s*\(([^)]+)\)\s+FROM\s+stdin;/);
    if (copyMatch) {
      // Skip users table data
      if (copyMatch[1].includes('users')) {
        inCopy = false;
        copyTable = null;
        continue;
      }
      inCopy = true;
      copyTable = copyMatch[1];
      copyColumns = copyMatch[2].split(',').map(c => c.trim());
      copyData = [];
    }
  } else if (inCopy && trimmed === '\\.') {
    // End of COPY data - convert to INSERT statements
    if (copyData.length > 0) {
      // Batch inserts for better performance
      const batchSize = 100;
      for (let i = 0; i < copyData.length; i += batchSize) {
        const batch = copyData.slice(i, i + batchSize);
        const values = batch.map(row => {
          const rowValues = copyColumns.map((_, idx) => escapeValue(row[idx] || 'NULL'));
          return `(${rowValues.join(', ')})`;
        }).join(', ');
        statements.push(`INSERT INTO ${copyTable} (${copyColumns.join(', ')}) VALUES ${values};`);
      }
    }
    inCopy = false;
    copyTable = null;
    copyColumns = null;
    copyData = [];
  } else if (inCopy) {
    // Parse tab-separated values
    const values = line.split('\t');
    if (values.length > 0 && values[0].trim() !== '') {
      copyData.push(values);
    }
  } else if (trimmed && !trimmed.startsWith('--') && trimmed !== '') {
    // Skip users table creation - it has a different schema in the app
    if (trimmed.includes('CREATE TABLE') && trimmed.includes('users')) {
      // Skip this statement and continue
      currentStatement = '';
      continue;
    }
    // Skip users sequence
    if (trimmed.includes('users_id_seq')) {
      currentStatement = '';
      continue;
    }
    if (trimmed.endsWith(';')) {
      statements.push(currentStatement + trimmed);
      currentStatement = '';
    } else {
      currentStatement += trimmed + ' ';
    }
  }
}

if (currentStatement.trim()) {
  statements.push(currentStatement.trim());
}

console.log(`📥 Importing ${statements.length} statements...`);

try {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (statement && statement.length > 0) {
      try {
        await client.query(statement);
        if ((i + 1) % 20 === 0 || i === statements.length - 1) {
          console.log(`   ✅ Processed ${i + 1}/${statements.length} statements...`);
        }
      } catch (err) {
        // Skip errors for things that might already exist (shouldn't happen after drop, but just in case)
        if (!err.message.includes('already exists') && 
            !err.message.includes('does not exist') &&
            !err.message.includes('duplicate key')) {
          console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message.substring(0, 100)}`);
        }
      }
    }
  }
  
  console.log('\n✅ Database reseeded successfully!');
  console.log('📊 Your database now has:');
  console.log('   - Collections, Categories, Subcollections, Subcategories, Products, Users');
  
  // Verify the data
  try {
    const collections = await client.query('SELECT COUNT(*) as count FROM public.collections');
    const categories = await client.query('SELECT COUNT(*) as count FROM public.categories');
    const products = await client.query('SELECT COUNT(*) as count FROM public.products');
    console.log(`\n📈 Record counts:`);
    console.log(`   - Collections: ${collections.rows[0]?.count || 0}`);
    console.log(`   - Categories: ${categories.rows[0]?.count || 0}`);
    console.log(`   - Products: ${products.rows[0]?.count || 0}`);
  } catch (error) {
    // Ignore verification errors
  }
  
  await client.end();
} catch (error) {
  console.error('❌ Error reseeding database:', error.message);
  await client.end();
  process.exit(1);
}
