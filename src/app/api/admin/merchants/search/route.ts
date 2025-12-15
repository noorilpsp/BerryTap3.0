import { NextResponse } from 'next/server'
import { desc, ilike } from 'drizzle-orm'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/db'
import { merchants } from '@/db/schema'
import { isPlatformAdmin } from '@/lib/permissions'

export async function GET(request: Request) {
  try {
    // Verify user is platform admin
  const supabase = await supabaseServer()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const isAdmin = await isPlatformAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json(
        { merchants: [] },
        {
          headers: {
            'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 minutes
          },
        },
      )
    }

    // Search all merchants in database
    const rows = await db
      .select({
        id: merchants.id,
        name: merchants.name,
        status: merchants.status,
        businessType: merchants.businessType,
        createdAt: merchants.createdAt,
      })
      .from(merchants)
      .where(ilike(merchants.name, `%${query}%`))
      .orderBy(desc(merchants.createdAt))
      .limit(100)

    // Format dates
    const formattedMerchants = rows.map((row) => ({
      ...row,
      createdAtFormatted: new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(row.createdAt),
    }))

    return NextResponse.json(
      { merchants: formattedMerchants },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 minutes
        },
      },
    )
  } catch (error) {
    console.error('[search-merchants] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search merchants' },
      { status: 500 },
    )
  }
}

