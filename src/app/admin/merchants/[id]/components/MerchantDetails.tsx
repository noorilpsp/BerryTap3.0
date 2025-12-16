import { Suspense } from 'react'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db } from '@/db'
import { merchants } from '@/db/schema'
import { merchantLocations } from '@/db/schema'
import { unstable_cache } from '@/lib/unstable-cache'
import { MerchantHeader } from './MerchantHeader'
import { MerchantInfoCards } from './MerchantInfoCards'
import { MerchantInfoCardsSkeleton } from './MerchantInfoCardsSkeleton'
import {
  MerchantLocationsWrapper,
  MerchantLocationsWrapperSkeleton,
} from './MerchantLocationsWrapper'

type MerchantDetailsProps = {
  merchantId: string
}

// Critical: Fetch merchant data immediately (needed for header)
async function getMerchantData(merchantId: string) {
  const getMerchant = unstable_cache(
    async () =>
      db
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)
        .then((rows) => rows[0]),
    ['merchant-detail', merchantId],
    { revalidate: 7200 },
  )

  return getMerchant()
}

// Non-critical: Locations can load separately
async function getMerchantLocationsData(merchantId: string) {
  const getMerchantLocations = unstable_cache(
    async () =>
      db
        .select()
        .from(merchantLocations)
        .where(eq(merchantLocations.merchantId, merchantId))
        .limit(50), // Limit to 50 locations to improve performance
    ['merchant-locations', merchantId],
    { revalidate: 7200 },
  )

  return getMerchantLocations()
}

export async function MerchantDetails({ merchantId }: MerchantDetailsProps) {
  // Critical: Fetch merchant immediately for header (above the fold)
  const merchant = await getMerchantData(merchantId)

  if (!merchant) {
    notFound()
  }

  // Start fetching locations in parallel (non-blocking)
  const locationsPromise = getMerchantLocationsData(merchantId)

  return (
    <div className="space-y-6">
      {/* Critical: Header shows immediately */}
      <MerchantHeader merchant={merchant} />

      {/* Non-critical: Info cards stream in via Suspense */}
      {/* Note: Merchant data is cached, so this will be fast */}
      <Suspense fallback={<MerchantInfoCardsSkeleton />}>
        <MerchantInfoCards merchant={merchant} />
      </Suspense>

      {/* Non-critical: Locations stream in via Suspense */}
      <Suspense fallback={<MerchantLocationsWrapperSkeleton />}>
        <MerchantLocationsWrapper
          merchantId={merchantId}
          locationsPromise={locationsPromise}
        />
      </Suspense>
    </div>
  )
}
