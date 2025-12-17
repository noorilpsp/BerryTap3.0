import Image from 'next/image'
import { Link } from '@/components/ui/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { merchants } from '@/db/schema'
import { getMerchantWithLocations } from '@/lib/queries'
import { MerchantHeader } from './components/MerchantHeader'
import { MerchantInfoCards } from './components/MerchantInfoCards'
import { MerchantLocationsWrapper } from './components/MerchantLocationsWrapper'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return await db.select({ id: merchants.id }).from(merchants)
}

export default async function MerchantDetailPage({ params }: PageProps) {
  const { id } = await params
  
  if (!id) {
    return notFound()
  }
  
  const merchantId = decodeURIComponent(id)
  const merchant = await getMerchantWithLocations(merchantId)

  if (!merchant || !merchant.id) {
    return notFound()
  }

  // Debug: log if merchant.id is somehow null
  if (merchant.id === null || merchant.id === undefined) {
    console.error('MerchantDetailPage: merchant.id is null!', { merchantId, merchant })
    return notFound()
  }

  const locations = merchant.locations ?? []
  let imageCount = 0

  return (
    <div className="container space-y-6 p-4">
      <MerchantHeader merchant={merchant} />
      
      <div className="border-b border-accent1 pb-3">
        <div className="flex flex-col gap-3">
          {locations[0]?.bannerUrl && (
            <div className="overflow-hidden rounded border">
              <Image
                loading={imageCount++ < 15 ? 'eager' : 'lazy'}
                decoding="sync"
                src={locations[0].bannerUrl.trimEnd()}
                alt={`Banner for ${merchant.name}`}
                width={960}
                height={240}
                quality={65}
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <MerchantInfoCards merchant={merchant} />
      <MerchantLocationsWrapper
        merchantId={merchantId}
        locations={locations}
      />
    </div>
  )
}
