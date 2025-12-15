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
    
    console.log('📊 Checking database contents...\n');
    
    // Check collections
    const collections = await client.query('SELECT id, name, slug FROM collections ORDER BY id LIMIT 10');
    console.log(`Collections (${collections.rows.length}):`);
    collections.rows.forEach(c => console.log(`   ${c.id}: ${c.name} (${c.slug})`));
    
    // Check categories and their collection_id
    const categories = await client.query(`
      SELECT slug, name, collection_id 
      FROM categories 
      ORDER BY collection_id 
      LIMIT 20
    `);
    console.log(`\nCategories (${categories.rows.length}):`);
    categories.rows.forEach(c => console.log(`   ${c.slug}: ${c.name} (collection_id: ${c.collection_id})`));
    
    // Check if categories have valid collection_ids
    const orphaned = await client.query(`
      SELECT COUNT(*) as count 
      FROM categories c 
      WHERE NOT EXISTS (
        SELECT 1 FROM collections col WHERE col.id = c.collection_id
      )
    `);
    console.log(`\n⚠️  Orphaned categories (invalid collection_id): ${orphaned.rows[0].count}`);
    
    // Check products
    const products = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`\nProducts: ${products.rows[0].count}`);
    
    // Check subcategories
    const subcategories = await client.query('SELECT COUNT(*) as count FROM subcategories');
    console.log(`Subcategories: ${subcategories.rows[0].count}`);
    
    // Check subcollections
    const subcollections = await client.query('SELECT COUNT(*) as count FROM subcollections');
    console.log(`Subcollections: ${subcollections.rows[0].count}`);
    
    // Test the actual query that the page uses
    console.log('\n🔍 Testing getCollectionDetails query...');
    const testCollection = await client.query(`
      SELECT c.id, c.name, c.slug, 
             cat.slug as cat_slug, cat.name as cat_name
      FROM collections c
      LEFT JOIN categories cat ON cat.collection_id = c.id
      WHERE c.slug = 'drawing-and-sketching'
      ORDER BY c.id, cat.slug
    `);
    
    if (testCollection.rows.length > 0) {
      console.log(`Found collection: ${testCollection.rows[0].name}`);
      const cats = testCollection.rows.filter(r => r.cat_slug).map(r => r.cat_name);
      console.log(`Categories: ${cats.length > 0 ? cats.join(', ') : 'NONE'}`);
    } else {
      console.log('No collection found with slug "drawing-and-sketching"');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
})();

