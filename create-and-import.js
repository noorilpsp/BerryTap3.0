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
const client = new Client({ connectionString });

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'data', 'data-small.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split into schema (CREATE/ALTER) and data (COPY/INSERT) parts
    const lines = sql.split('\n');
    let schemaSQL = '';
    let dataSQL = '';
    let inDataSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('COPY public.') || trimmed.startsWith('-- Data for Name:')) {
        inDataSection = true;
      }
      
      if (!inDataSection) {
        schemaSQL += line + '\n';
      } else {
        dataSQL += line + '\n';
      }
    }
    
    console.log('📋 Step 1: Creating schema...');
    // Execute the entire schema SQL (it has proper statement separators)
    // Split by semicolon but keep multi-line statements together
    const allStatements = schemaSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    let executed = 0;
    for (const statement of allStatements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length < 5) continue;
      
      try {
        await client.query(statement + ';');
        executed++;
      } catch (err) {
        // Ignore "already exists" and "role does not exist" errors
        if (!err.message.includes('already exists') && 
            !err.message.includes('does not exist') &&
            !err.message.includes('role')) {
          // Only log unexpected errors
          if (statement.substring(0, 20).includes('CREATE') || statement.substring(0, 20).includes('ALTER')) {
            console.warn(`   ⚠️  ${err.message.substring(0, 60)}`);
          }
        }
      }
    }
    console.log(`✅ Schema created (executed ${executed} statements)\n`);
    
    console.log('📦 Step 2: Importing data...');
    // Convert COPY to INSERT and import data
    const dataLines = dataSQL.split('\n');
    let inCopy = false;
    let copyTable = null;
    let copyColumns = null;
    let insertStatements = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
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
          insertStatements.push(`INSERT INTO public.${copyTable} (${copyColumns.join(', ')}) VALUES (${escapedValues.join(', ')})`);
        }
      }
    }
    
    console.log(`   Importing ${insertStatements.length} rows...`);
    for (let i = 0; i < insertStatements.length; i++) {
      try {
        await client.query(insertStatements[i]);
        if ((i + 1) % 50 === 0 || i === insertStatements.length - 1) {
          console.log(`   ✅ Processed ${i + 1}/${insertStatements.length} rows...`);
        }
      } catch (err) {
        if (!err.message.includes('duplicate key') && !err.message.includes('violates foreign key')) {
          // Skip expected errors
        }
      }
    }
    
    // Verify
    const collections = await client.query('SELECT COUNT(*) FROM collections');
    const categories = await client.query('SELECT COUNT(*) FROM categories');
    const products = await client.query('SELECT COUNT(*) FROM products');
    
    console.log('\n✅ Database setup complete!');
    console.log(`📊 Data:`);
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

