import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { getSessionPermissions } from '@/lib/permissions/getSessionPermissions'

/**
 * GET /api/session/permissions
 * 
 * Unified endpoint for all session permissions
 * Returns lightweight data optimized for initial page load
 * Extended data (like full merchant details) is lazy loaded via other endpoints
 * 
 * Cache: 10 minutes (both server and client)
 */
export async function GET(request: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single cached query - revalidates every 10 minutes
    const permissions = await getSessionPermissions(user.id)

    return NextResponse.json(permissions, {
      headers: {
        // No browser cache - always validate with server to prevent cross-user data leaks
        // Server-side cache (unstable_cache) is still active and keyed by userId
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('[session/permissions] Error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch session permissions',
      },
      { status: 500 }
    )
  }
}