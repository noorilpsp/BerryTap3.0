import { neon } from '@neondatabase/serverless'
import { loadEnvConfig } from '@next/env'

// Load environment variables
const projectDir = process.cwd()
loadEnvConfig(projectDir)

async function cleanupOrphanedPersonnel() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    console.error('DATABASE_URL or POSTGRES_URL is not set')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    console.log('Checking for orphaned platform_personnel records...')

    // Find orphaned records
    const orphaned = await sql`
      SELECT pp.user_id 
      FROM platform_personnel pp
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE u.id IS NULL
    `

    if (orphaned.length === 0) {
      console.log('No orphaned records found.')
      return
    }

    console.log(`Found ${orphaned.length} orphaned record(s):`)
    orphaned.forEach((record: any) => {
      console.log(`  - user_id: ${record.user_id}`)
    })

    // Delete orphaned records
    const result = await sql`
      DELETE FROM platform_personnel
      WHERE user_id NOT IN (SELECT id FROM users)
    `

    console.log(`Successfully deleted ${orphaned.length} orphaned record(s).`)
  } catch (error) {
    console.error('Error cleaning up orphaned records:', error)
    process.exit(1)
  }
}

cleanupOrphanedPersonnel()
  .then(() => {
    console.log('Cleanup completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })
