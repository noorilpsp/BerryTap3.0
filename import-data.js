const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  }
});

const connectionString = env.POSTGRES_URL || env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL or DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('📦 Reading data-small.sql...');
const sqlFile = path.join(__dirname, 'data', 'data-small.sql');
let sql = fs.readFileSync(sqlFile, 'utf8');

// Convert COPY statements to INSERT statements
console.log('🔄 Converting COPY statements to INSERT...');
const lines = sql.split('\n');
let convertedSQL = '';
let inCopy = false;
let copyTable = null;
let copyColumns = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed.startsWith('COPY public.')) {
    // Start of COPY statement
    const match = trimmed.match(/COPY public\.(\w+)\s*\(([^)]+)\)\s*FROM stdin;/);
    if (match) {
      inCopy = true;
      copyTable = match[1];
      copyColumns = match[2].split(',').map(c => c.trim());
    }
  } else if (inCopy && trimmed === '\\.') {
    // End of COPY statement
    inCopy = false;
    copyTable = null;
    copyColumns = null;
  } else if (inCopy && copyTable && trimmed && !trimmed.startsWith('--')) {
    // Data row - convert to INSERT
    const values = trimmed.split('\t');
    if (values.length === copyColumns.length) {
      const escapedValues = values.map(v => {
        if (v === '\\N' || v === '') return 'NULL';
        return `'${v.replace(/'/g, "''")}'`;
      });
      convertedSQL += `INSERT INTO public.${copyTable} (${copyColumns.join(', ')}) VALUES (${escapedValues.join(', ')});\n`;
    }
  } else if (!inCopy) {
    // Regular SQL statement
    if (trimmed && !trimmed.startsWith('--')) {
      convertedSQL += line + '\n';
    }
  }
}

console.log('🔌 Connecting to Neon database...');
const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    console.log('📥 Importing data (this may take a moment)...');
    // Split into individual statements and execute
    const statements = convertedSQL.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await client.query(statement);
          if ((i + 1) % 20 === 0 || i === statements.length - 1) {
            console.log(`   ✅ Processed ${i + 1}/${statements.length} statements...`);
          }
        } catch (err) {
          // Skip errors for things that might already exist
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate key') &&
              !err.message.includes('does not exist')) {
            console.warn(`   ⚠️  Warning: ${err.message.substring(0, 80)}`);
          }
        }
      }
    }
    
    console.log('✅ Data import completed successfully!');
    console.log('📊 Your database now has:');
    console.log('   - Collections, Categories, Subcollections, Subcategories, Products');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    await client.end();
    process.exit(1);
  }
})();

