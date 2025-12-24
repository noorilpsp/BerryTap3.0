import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/db'
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

    // Search all merchants in database with locations using query builder
    const rows = await db.query.merchants.findMany({
      where: (merchants, { ilike }) => ilike(merchants.name, `%${query}%`),
      columns: {
        id: true,
        name: true,
        status: true,
        businessType: true,
        createdAt: true,
      },
      with: {
        locations: {
          columns: {
            logoUrl: true,
            bannerUrl: true,
          },
          orderBy: (merchantLocations, { desc }) => [
            desc(merchantLocations.createdAt),
          ],
        },
      },
      orderBy: (merchants, { desc }) => [desc(merchants.createdAt)],
      limit: 100,
    })

    // Format dates and add location count
    const merchantsWithLocations = rows.map((merchant) => ({
      ...merchant,
      locationCount: merchant.locations?.length ?? 0,
      createdAtFormatted: new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(merchant.createdAt),
    }))

    return NextResponse.json(
      { merchants: merchantsWithLocations },
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

