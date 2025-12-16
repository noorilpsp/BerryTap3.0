import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { isPlatformAdmin } from '@/lib/permissions'

/**
 * Lightweight endpoint that only returns platform admin status.
 * Much faster than /api/user/permissions which fetches all merchant data.
 */
export async function GET() {
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

    // Check platform admin status (uses cache)
    const isAdmin = await isPlatformAdmin(userId)

    return NextResponse.json(
      { isAdmin },
      {
        headers: {
          'Cache-Control': 'private, max-age=600, s-maxage=600', // 10 minutes
        },
      },
    )
  } catch (error) {
    console.error('[user/is-admin] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check admin status',
      },
      { status: 500 },
    )
  }
}

