import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabaseServer'
import { isPlatformAdmin, clearPlatformAdminCache } from '@/lib/permissions'

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await supabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Only platform admins can clear cache
    const isAdmin = await isPlatformAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId } = await request.json().catch(() => ({}))

    // If targetUserId is provided, clear cache for that user
    // Otherwise, clear cache for the current user
    const userIdToClear = targetUserId || userId

    // Clear in-memory cache
    clearPlatformAdminCache(userIdToClear)

    // Revalidate the permissions API path to clear Next.js cache
    revalidatePath('/api/user/permissions')

    return NextResponse.json({
      success: true,
      message: `Cache cleared for user ${userIdToClear}`,
      clearedUserId: userIdToClear,
      clearedCaches: [
        'in-memory platform admin cache',
        'Next.js unstable_cache for permissions',
      ],
    })
  } catch (error) {
    console.error('[clear-cache] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to clear cache',
      },
      { status: 500 },
    )
  }
}
