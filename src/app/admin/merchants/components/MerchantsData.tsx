import { Suspense } from 'react'
import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { merchants } from '@/db/schema'
import { unstable_cache } from '@/lib/unstable-cache'
import { MerchantsList } from './MerchantsList'
import { MerchantsTableSkeleton } from './MerchantsTableSkeleton'
import { NewMerchantButton } from './NewMerchantButton'

// Optimized date formatting - only format what we need
function formatDate(value: Date | string | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const getMerchants = unstable_cache(
  async () =>
    db
      .select({
        id: merchants.id,
        name: merchants.name,
        status: merchants.status,
        businessType: merchants.businessType,
        createdAt: merchants.createdAt,
      })
      .from(merchants)
      .orderBy(desc(merchants.createdAt))
      .limit(100), // Limit for better initial load performance
  ['admin-merchants-list'],
  { revalidate: 7200 },
)

// Async component for merchants table (wrapped in Suspense)
async function MerchantsTableAsync() {
  type MerchantRow = {
    id: string
    name: string
    status: string
    businessType: string
    createdAt: Date | string | null
  }

  const rows = (await getMerchants()) as MerchantRow[]

  // Format dates in Server Component (cached, so fast)
  const formattedMerchants = rows.map((row) => ({
    ...row,
    createdAtFormatted: formatDate(row.createdAt),
  }))

  return (
    <MerchantsList
      merchants={formattedMerchants}
      newMerchantButton={<NewMerchantButton />}
    />
  )
}

export async function MerchantsData() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Merchants</h1>
          <p className="text-muted-foreground">
            View and search merchants. Click a row to open details.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <NewMerchantButton />
        </div>
      </div>

      {/* Stream merchants table via Suspense */}
      <Suspense fallback={<MerchantsTableSkeleton />}>
        <MerchantsTableAsync />
      </Suspense>
    </div>
  )
}

