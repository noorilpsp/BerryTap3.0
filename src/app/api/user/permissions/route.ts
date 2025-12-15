import { NextResponse } from 'next/server'
import { eq, inArray } from 'drizzle-orm'

import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/db'
import { merchantUsers, merchants, merchantLocations } from '@/db/schema'
import { isPlatformAdmin } from '@/lib/permissions'
import { unstable_cache } from '@/lib/unstable-cache'

export async function GET(request: Request) {
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

    // Check platform admin status
    const platformAdmin = await isPlatformAdmin(userId)

    // Get all active merchant memberships with merchant details
    const getMemberships = unstable_cache(
      async () =>
        db
          .select({
            membershipId: merchantUsers.id,
            merchantId: merchantUsers.merchantId,
            role: merchantUsers.role,
            locationAccess: merchantUsers.locationAccess,
            permissions: merchantUsers.permissions,
            isActive: merchantUsers.isActive,
            membershipCreatedAt: merchantUsers.createdAt,
            merchantName: merchants.name,
            merchantLegalName: merchants.legalName,
            merchantStatus: merchants.status,
            businessType: merchants.businessType,
          })
          .from(merchantUsers)
          .innerJoin(merchants, eq(merchants.id, merchantUsers.merchantId))
          .where(eq(merchantUsers.userId, userId))
          .orderBy(merchantUsers.createdAt),
      ['user-permissions-memberships', userId],
      { revalidate: 7200 },
    )

    const merchantMemberships = (await getMemberships()) as Array<{
      membershipId: string
      merchantId: string
      role: 'owner' | 'admin' | 'manager'
      locationAccess: string[] | null
      permissions: Record<string, boolean> | null
      isActive: boolean
      membershipCreatedAt: Date | null
      merchantName: string
      merchantLegalName: string
      merchantStatus: string
      businessType: string
    }>

    // Filter to only active memberships
    const activeMemberships = merchantMemberships.filter((m) => m.isActive)

    // Get all locations for all merchants in one query
    const merchantIds = activeMemberships.map((m) => m.merchantId)
    const allLocationsByMerchant =
      merchantIds.length > 0
        ? await unstable_cache(
            async () =>
              db
                .select({
                  id: merchantLocations.id,
                  merchantId: merchantLocations.merchantId,
                  name: merchantLocations.name,
                  address: merchantLocations.address,
                  city: merchantLocations.city,
                  status: merchantLocations.status,
                })
                .from(merchantLocations)
                .where(inArray(merchantLocations.merchantId, merchantIds)),
            ['user-permissions-locations', userId, merchantIds.join(',')],
            { revalidate: 7200 },
          )()
        : []

    // Group locations by merchant ID
    const locationsByMerchantId = new Map<string, typeof allLocationsByMerchant>()
    for (const location of allLocationsByMerchant) {
      if (!locationsByMerchantId.has(location.merchantId)) {
        locationsByMerchantId.set(location.merchantId, [])
      }
      locationsByMerchantId.get(location.merchantId)!.push(location)
    }

    // Build merchant data with locations
    const validMerchantData = activeMemberships.map((membership) => {
      const allLocations = locationsByMerchantId.get(membership.merchantId) ?? []

      // Determine accessible locations based on role
      let accessibleLocations = allLocations

      // If user is a manager, filter to only accessible locations
      if (membership.role === 'manager') {
        const locationAccess = membership.locationAccess ?? []
        accessibleLocations = allLocations.filter((loc: { id: string }) =>
          locationAccess.includes(loc.id),
        )
      }
      // Owners and admins have access to all locations (already set above)

      return {
        merchantId: membership.merchantId,
        merchantName: membership.merchantName,
        merchantLegalName: membership.merchantLegalName,
        merchantStatus: membership.merchantStatus,
        businessType: membership.businessType,
        role: membership.role,
        locationAccess: membership.locationAccess ?? [],
        permissions: membership.permissions ?? {},
        accessibleLocations: accessibleLocations.map((loc: { id: string; name: string; address: string; city: string; status: string }) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          status: loc.status,
        })),
        allLocationsCount: allLocations.length,
        accessibleLocationsCount: accessibleLocations.length,
        membershipCreatedAt: membership.membershipCreatedAt,
      }
    })

    // Build response
    const response = {
      userId,
      platformAdmin,
      merchantMemberships: validMerchantData,
      totalMerchants: validMerchantData.length,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=600, s-maxage=600', // 10 minutes (private since user-specific)
      },
    })
  } catch (error) {
    console.error('[user-permissions] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch user permissions',
      },
      { status: 500 },
    )
  }
}

