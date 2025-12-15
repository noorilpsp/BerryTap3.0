import { NextResponse } from 'next/server'

import { db } from '@/db'
import { users, platformPersonnel } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ADMIN_PROMOTE_SECRET = process.env.ADMIN_PROMOTE_SECRET

export async function POST(request: Request) {
  if (!ADMIN_PROMOTE_SECRET) {
    return NextResponse.json({ message: 'Admin promote secret not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (authHeader !== `Bearer ${ADMIN_PROMOTE_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await request.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 })
  }

  // Find the user by email
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length === 0) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  const user = existing[0]

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

  return NextResponse.json({ success: true, userId: user.id, role: 'super_admin' })
}

