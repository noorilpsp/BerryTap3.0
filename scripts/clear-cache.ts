import { loadEnvConfig } from '@next/env'

// Load environment variables
const projectDir = process.cwd()
loadEnvConfig(projectDir)

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx tsx scripts/clear-cache.ts <email>')
  console.log('   Or visit: POST /api/admin/clear-cache')
  process.exit(1)
}

async function clearCache() {
  try {
    // First, we need to get a session token, but for simplicity,
    // this script assumes you'll use the API endpoint directly
    console.log(`📡 Clearing cache for user: ${email}`)
    console.log(`   API: ${API_URL}/api/admin/clear-cache`)
    console.log('')
    console.log('⚠️  To clear cache, you can:')
    console.log('   1. Use the API endpoint: POST /api/admin/clear-cache')
    console.log('   2. Use the admin UI button (if available)')
    console.log('   3. Restart the dev server')
    console.log('')
    console.log('💡 Example curl command:')
    console.log(`   curl -X POST ${API_URL}/api/admin/clear-cache \\`)
    console.log('     -H "Content-Type: application/json" \\')
    console.log('     -H "Cookie: your-session-cookie" \\')
    console.log(`     -d \'{"targetUserId": "user-id-here"}\'`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

clearCache()
