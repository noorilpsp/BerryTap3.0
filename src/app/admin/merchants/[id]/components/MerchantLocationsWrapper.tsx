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
  locations: Location[]
}

export function MerchantLocationsWrapper({
  merchantId,
  locations,
}: MerchantLocationsWrapperProps) {
  return (
    <LocationsList
      locations={locations}
      totalLocations={locations.length}
    />
  )
}
