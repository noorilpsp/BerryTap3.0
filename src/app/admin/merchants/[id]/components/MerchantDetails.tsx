import { notFound } from 'next/navigation'
import { getMerchantWithLocations } from '@/lib/queries'
import { MerchantHeader } from './MerchantHeader'
import { MerchantInfoCards } from './MerchantInfoCards'
import { MerchantLocationsWrapper } from './MerchantLocationsWrapper'

type MerchantDetailsProps = {
  merchantId: string
}

export async function MerchantDetails({ merchantId }: MerchantDetailsProps) {
  const merchant = await getMerchantWithLocations(merchantId)

  if (!merchant) {
    notFound()
  }

  const locations = merchant.locations ?? []

  return (
    <div className="space-y-6">
      <MerchantHeader merchant={merchant} />
      <MerchantInfoCards merchant={merchant} />
      <MerchantLocationsWrapper
        merchantId={merchantId}
        locations={locations}
      />
    </div>
  )
}
