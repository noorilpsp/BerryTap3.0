import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LocationsList } from './LocationsList'

type Location = {
  id: string
  name: string
  address: string
  postalCode: string
  city: string
  phone: string
  email: string | null
  logoUrl: string | null
  bannerUrl: string | null
  status: 'coming_soon' | 'active' | 'temporarily_closed' | 'closed'
  createdAt: Date | string
  updatedAt: Date | string
}

type MerchantLocationsWrapperProps = {
  merchantId: string
  locationsPromise: Promise<Location[]>
}

function LocationsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export async function MerchantLocationsWrapper({
  merchantId,
  locationsPromise,
}: MerchantLocationsWrapperProps) {
  const locations = await locationsPromise

  return (
    <LocationsList
      locations={locations}
      totalLocations={locations.length}
    />
  )
}

export function MerchantLocationsWrapperSkeleton() {
  return <LocationsSkeleton />
}
