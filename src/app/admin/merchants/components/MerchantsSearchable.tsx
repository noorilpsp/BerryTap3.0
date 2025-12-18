'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from '@/components/ui/link'
import { MerchantSearch } from './MerchantSearch'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { NewMerchantButton } from './NewMerchantButton'

type Merchant = {
  id: string
  name: string
  status: string
  businessType: string
  createdAtFormatted: string
  locations?: Array<{
    logoUrl: string | null
    bannerUrl: string | null
  }>
}

type MerchantsSearchableProps = {
  initialMerchants: Merchant[]
}

export function MerchantsSearchable({ initialMerchants }: MerchantsSearchableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [serverResults, setServerResults] = useState<Merchant[]>([])
  const [isSearchingServer, setIsSearchingServer] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Client-side filter first - super quick!
  const clientFiltered = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialMerchants
    }
    const query = searchQuery.toLowerCase().trim()
    return initialMerchants.filter(
      (merchant) =>
        merchant.name.toLowerCase().includes(query) ||
        merchant.businessType?.toLowerCase().includes(query) ||
        merchant.status?.toLowerCase().includes(query)
    )
  }, [initialMerchants, searchQuery])

  // Server-side search when client-side returns no results
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    const trimmedQuery = searchQuery.trim()

    // Only search server if:
    // 1. There's a search query
    // 2. Client-side found no results
    // 3. Query is at least 2 characters (avoid searching for single letters)
    if (trimmedQuery && clientFiltered.length === 0 && trimmedQuery.length >= 2) {
      setIsSearchingServer(true)

      // Small debounce to avoid too many requests
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/admin/merchants/search?q=${encodeURIComponent(trimmedQuery)}`
          )
          if (response.ok) {
            const data = await response.json()
            setServerResults(data.merchants || [])
          } else {
            setServerResults([])
          }
        } catch (error) {
          console.error('Server search error:', error)
          setServerResults([])
        } finally {
          setIsSearchingServer(false)
        }
      }, 300)
    } else {
      // Clear server results if client-side has results or query is cleared
      setServerResults([])
      setIsSearchingServer(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, clientFiltered.length])

  // Merge client and server results, removing duplicates
  const allResults = useMemo(() => {
    if (serverResults.length === 0) {
      return clientFiltered
    }

    // Combine and remove duplicates by ID
    const combined = [...clientFiltered, ...serverResults]
    const unique = combined.filter(
      (merchant, index, self) => index === self.findIndex((m) => m.id === merchant.id)
    )
    return unique
  }, [clientFiltered, serverResults])

  const displayResults = allResults
  const hasResults = displayResults.length > 0
  const showNoResults = searchQuery.trim() && !hasResults && !isSearchingServer

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Merchants</h1>
          <p className="text-muted-foreground">
            View and search merchants. Click a merchant to open details.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <MerchantSearch value={searchQuery} onChange={setSearchQuery} />
          <NewMerchantButton />
        </div>
      </div>

      <div className="w-full p-4">
        <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
          {isSearchingServer ? (
            <span>Searching all merchants...</span>
          ) : (
            <>
              {displayResults.length.toLocaleString()}{' '}
              {displayResults.length === 1 ? 'merchant' : 'merchants'}
              {searchQuery.trim() && (
                <span className="text-muted-foreground font-normal">
                  {' '}
                  for &quot;{searchQuery}&quot;
                </span>
              )}
            </>
          )}
        </div>

        {showNoResults && (
          <div className="py-8 text-center text-muted-foreground">
            <p>No merchants found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {hasResults && (
          <div className="flex flex-row flex-wrap justify-center gap-4 border-b-2 py-4 sm:justify-start">
            {displayResults.map((merchant, index) => (
              <Link
                prefetch={true}
                key={merchant.id}
                className="flex w-[200px] flex-col items-start rounded-lg border p-4 hover:bg-accent2 transition-colors"
                href={`/admin/merchants/${merchant.id}`}
              >
                <Image
                  loading={index < 15 ? 'eager' : 'lazy'}
                  decoding="sync"
                  src={
                    merchant.locations?.[0]?.logoUrl?.trimEnd() ?? '/placeholder.svg'
                  }
                  alt={`Logo for ${merchant.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  width={48}
                  height={48}
                  quality={65}
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-base">{merchant.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {merchant.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="capitalize">Type: {merchant.businessType}</div>
                  <div>Created: {merchant.createdAtFormatted}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
