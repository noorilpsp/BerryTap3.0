import { neon } from '@neondatabase/serverless'
import { loadEnvConfig } from '@next/env'

// Load environment variables
const projectDir = process.cwd()
loadEnvConfig(projectDir)

async function cleanupOrphanedData() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    console.error('DATABASE_URL or POSTGRES_URL is not set')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    console.log('Cleaning up orphaned data...\n')

    // 1. Clean up orphaned platform_personnel
    console.log('1. Checking platform_personnel...')
    const orphanedPersonnel = await sql`
      SELECT pp.user_id 
      FROM platform_personnel pp
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE u.id IS NULL
    `
    if (orphanedPersonnel.length > 0) {
      await sql`DELETE FROM platform_personnel WHERE user_id NOT IN (SELECT id FROM users)`
      console.log(`   Deleted ${orphanedPersonnel.length} orphaned platform_personnel record(s)`)
    } else {
      console.log('   No orphaned records found')
    }

    // 2. Clean up orphaned products (referencing non-existent subcategories)
    console.log('\n2. Checking products...')
    const orphanedProducts = await sql`
      SELECT p.slug, p.subcategory_slug
      FROM products p
      LEFT JOIN subcategories sc ON p.subcategory_slug = sc.slug
      WHERE sc.slug IS NULL
    `
    if (orphanedProducts.length > 0) {
      console.log(`   Found ${orphanedProducts.length} orphaned product(s):`)
      orphanedProducts.forEach((p: any) => {
        console.log(`     - ${p.slug} (references subcategory: ${p.subcategory_slug})`)
      })
      await sql`DELETE FROM products WHERE subcategory_slug NOT IN (SELECT slug FROM subcategories)`
      console.log(`   Deleted ${orphanedProducts.length} orphaned product(s)`)
    } else {
      console.log('   No orphaned records found')
    }

    // 3. Clean up orphaned subcategories (referencing non-existent subcollections)
    console.log('\n3. Checking subcategories...')
    const orphanedSubcategories = await sql`
      SELECT sc.slug, sc.subcollection_id
      FROM subcategories sc
      LEFT JOIN subcollections scl ON sc.subcollection_id = scl.id
      WHERE scl.id IS NULL
    `
    if (orphanedSubcategories.length > 0) {
      console.log(`   Found ${orphanedSubcategories.length} orphaned subcategory(ies):`)
      orphanedSubcategories.forEach((sc: any) => {
        console.log(`     - ${sc.slug} (references subcollection: ${sc.subcollection_id})`)
      })
      await sql`DELETE FROM subcategories WHERE subcollection_id NOT IN (SELECT id FROM subcollections)`
      console.log(`   Deleted ${orphanedSubcategories.length} orphaned subcategory(ies)`)
    } else {
      console.log('   No orphaned records found')
    }

    // 4. Clean up orphaned subcollections (referencing non-existent categories)
    console.log('\n4. Checking subcollections...')
    const orphanedSubcollections = await sql`
      SELECT scl.id, scl.category_slug
      FROM subcollections scl
      LEFT JOIN categories c ON scl.category_slug = c.slug
      WHERE c.slug IS NULL
    `
    if (orphanedSubcollections.length > 0) {
      console.log(`   Found ${orphanedSubcollections.length} orphaned subcollection(s):`)
      orphanedSubcollections.forEach((scl: any) => {
        console.log(`     - ${scl.id} (references category: ${scl.category_slug})`)
      })
      await sql`DELETE FROM subcollections WHERE category_slug NOT IN (SELECT slug FROM categories)`
      console.log(`   Deleted ${orphanedSubcollections.length} orphaned subcollection(s)`)
    } else {
      console.log('   No orphaned records found')
    }

    // 5. Clean up orphaned categories (referencing non-existent collections)
    console.log('\n5. Checking categories...')
    const orphanedCategories = await sql`
      SELECT c.slug, c.collection_id
      FROM categories c
      LEFT JOIN collections col ON c.collection_id = col.id
      WHERE col.id IS NULL
    `
    if (orphanedCategories.length > 0) {
      console.log(`   Found ${orphanedCategories.length} orphaned category(ies):`)
      orphanedCategories.forEach((c: any) => {
        console.log(`     - ${c.slug} (references collection: ${c.collection_id})`)
      })
      await sql`DELETE FROM categories WHERE collection_id NOT IN (SELECT id FROM collections)`
      console.log(`   Deleted ${orphanedCategories.length} orphaned category(ies)`)
    } else {
      console.log('   No orphaned records found')
    }

    console.log('\n✅ Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error cleaning up orphaned data:', error)
    process.exit(1)
  }
}

cleanupOrphanedData()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })
