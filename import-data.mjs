import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
const sqlClient = neon(connectionString);

// Split SQL into statements (handle COPY specially)
const lines = sql.split('\n');
let currentStatement = '';
let inCopy = false;
const statements = [];

for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed.startsWith('COPY ')) {
    inCopy = true;
    currentStatement = line + '\n';
  } else if (inCopy && trimmed === '\\.') {
    currentStatement += line + '\n';
    statements.push(currentStatement);
    currentStatement = '';
    inCopy = false;
  } else if (inCopy) {
    currentStatement += line + '\n';
  } else if (trimmed && !trimmed.startsWith('--') && trimmed !== '') {
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
        await sqlClient(statement);
        if ((i + 1) % 20 === 0 || i === statements.length - 1) {
          console.log(`   ✅ Processed ${i + 1}/${statements.length} statements...`);
        }
      } catch (err) {
        // Skip errors for things that might already exist
        if (!err.message.includes('already exists') && 
            !err.message.includes('does not exist') &&
            !err.message.includes('duplicate key')) {
          console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message.substring(0, 80)}`);
        }
      }
    }
  }
  
  console.log('✅ Data import completed successfully!');
  console.log('📊 Your database now has:');
  console.log('   - Collections, Categories, Subcollections, Subcategories, Products');
} catch (error) {
  console.error('❌ Error importing data:', error.message);
  process.exit(1);
}

