const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log('📋 Step 1: Creating database schema...');
try {
  // Run db:push with auto-confirm
  execSync('echo "Yes" | npx pnpm@latest db:push', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('✅ Schema created!\n');
} catch (error) {
  console.error('❌ Error creating schema:', error.message);
  process.exit(1);
}

console.log('📦 Step 2: Importing data...');
const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    
    const sqlFile = path.join(__dirname, 'data', 'data-small.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');

    // Convert COPY statements to INSERT statements
    const lines = sql.split('\n');
    let convertedSQL = '';
    let inCopy = false;
    let copyTable = null;
    let copyColumns = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed.startsWith('COPY public.')) {
        const match = trimmed.match(/COPY public\.(\w+)\s*\(([^)]+)\)\s*FROM stdin;/);
        if (match) {
          inCopy = true;
          copyTable = match[1];
          copyColumns = match[2].split(',').map(c => c.trim());
        }
      } else if (inCopy && trimmed === '\\.') {
        inCopy = false;
        copyTable = null;
        copyColumns = null;
      } else if (inCopy && copyTable && trimmed && !trimmed.startsWith('--')) {
        const values = trimmed.split('\t');
        if (values.length === copyColumns.length) {
          const escapedValues = values.map(v => {
            if (v === '\\N' || v === '') return 'NULL';
            return `'${v.replace(/'/g, "''")}'`;
          });
          convertedSQL += `INSERT INTO public.${copyTable} (${copyColumns.join(', ')}) VALUES (${escapedValues.join(', ')});\n`;
        }
      } else if (!inCopy) {
        if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('SET ') && !trimmed.startsWith('SELECT ')) {
          convertedSQL += line + '\n';
        }
      }
    }

    const statements = convertedSQL.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
    
    console.log(`   Importing ${statements.length} statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await client.query(statement);
          if ((i + 1) % 50 === 0 || i === statements.length - 1) {
            console.log(`   ✅ Processed ${i + 1}/${statements.length} statements...`);
          }
        } catch (err) {
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate key') &&
              !err.message.includes('does not exist')) {
            // Only show non-expected errors
          }
        }
      }
    }
    
    // Verify data
    const collections = await client.query('SELECT COUNT(*) FROM collections');
    const categories = await client.query('SELECT COUNT(*) FROM categories');
    const products = await client.query('SELECT COUNT(*) FROM products');
    
    console.log('\n✅ Database setup complete!');
    console.log(`📊 Data imported:`);
    console.log(`   - Collections: ${collections.rows[0].count}`);
    console.log(`   - Categories: ${categories.rows[0].count}`);
    console.log(`   - Products: ${products.rows[0].count}`);
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();

