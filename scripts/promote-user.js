const { drizzle } = require('drizzle-orm/neon-http')
const { neon } = require('@neondatabase/serverless')
const { eq } = require('drizzle-orm')
const { users, platformPersonnel } = require('../src/db/schema')

async function promoteUser(email) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  const sql = neon(connectionString)
  const db = drizzle({ client: sql, schema: { users, platformPersonnel } })

  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Find the user by email
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existing.length === 0) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    const user = existing[0]
    console.log(`✅ Found user: ${user.id} (${user.email})`)

    // Upsert into platform_personnel as super_admin
    await db
      .insert(platformPersonnel)
      .values({
        userId: user.id,
        role: 'super_admin',
        department: 'platform',
        isActive: true,
        lastLoginAt: user.lastLoginAt ?? null,
      })
      .onConflictDoUpdate({
        target: platformPersonnel.userId,
        set: {
          role: 'super_admin',
          isActive: true,
          lastLoginAt: user.lastLoginAt ?? null,
        },
      })

    console.log(`✅ Successfully promoted ${email} to super_admin`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Role: super_admin`)
    
  } catch (error) {
    console.error('❌ Error promoting user:', error)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/promote-user.js <email>')
  process.exit(1)
}

promoteUser(email)
