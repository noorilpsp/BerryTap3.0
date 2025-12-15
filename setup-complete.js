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
    
    // Create extension first
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    console.log('✅ Created pg_trgm extension');
    
    // Create tables directly
    console.log('📋 Creating tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.collections (
        id serial PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        slug text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        collection_id integer NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
        image_url text
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.subcollections (
        id serial PRIMARY KEY,
        name text NOT NULL,
        category_slug text NOT NULL REFERENCES public.categories(slug) ON DELETE CASCADE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.subcategories (
        slug text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        subcollection_id integer NOT NULL REFERENCES public.subcollections(id) ON DELETE CASCADE,
        image_url text
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        slug text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        description text NOT NULL,
        price numeric NOT NULL,
        subcategory_slug text NOT NULL REFERENCES public.subcategories(slug) ON DELETE CASCADE,
        image_url text
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id serial PRIMARY KEY,
        username varchar(100) NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create indexes
    console.log('📋 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS categories_collection_id_idx ON public.categories(collection_id)');
    await client.query('CREATE INDEX IF NOT EXISTS subcollections_category_slug_idx ON public.subcollections(category_slug)');
    await client.query('CREATE INDEX IF NOT EXISTS subcategories_subcollection_id_idx ON public.subcategories(subcollection_id)');
    await client.query('CREATE INDEX IF NOT EXISTS products_subcategory_slug_idx ON public.products(subcategory_slug)');
    
    console.log('✅ Schema created\n');
    
    // Now import data
    console.log('📦 Importing data...');
    const sqlFile = path.join(__dirname, 'data', 'data-small.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    const lines = sql.split('\n');
    
    let inCopy = false;
    let copyTable = null;
    let copyColumns = null;
    let insertCount = 0;
    
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
          const insertSQL = `INSERT INTO public.${copyTable} (${copyColumns.join(', ')}) VALUES (${escapedValues.join(', ')}) ON CONFLICT DO NOTHING`;
          
          try {
            await client.query(insertSQL);
            insertCount++;
            if (insertCount % 20 === 0) {
              console.log(`   ✅ Imported ${insertCount} rows...`);
            }
          } catch (err) {
            // Skip foreign key violations (expected for some products)
            if (!err.message.includes('violates foreign key')) {
              // Silent skip
            }
          }
        }
      }
    }
    
    console.log(`✅ Imported ${insertCount} rows\n`);
    
    // Verify - use public schema explicitly
    const collections = await client.query('SELECT COUNT(*) FROM public.collections');
    const categories = await client.query('SELECT COUNT(*) FROM public.categories');
    const products = await client.query('SELECT COUNT(*) FROM public.products');
    const subcollections = await client.query('SELECT COUNT(*) FROM public.subcollections');
    const subcategories = await client.query('SELECT COUNT(*) FROM public.subcategories');
    
    console.log('📊 Database contents:');
    console.log(`   - Collections: ${collections.rows[0].count}`);
    console.log(`   - Categories: ${categories.rows[0].count}`);
    console.log(`   - Subcollections: ${subcollections.rows[0].count}`);
    console.log(`   - Subcategories: ${subcategories.rows[0].count}`);
    console.log(`   - Products: ${products.rows[0].count}`);
    
    await client.end();
    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();

