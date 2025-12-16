'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { MerchantSearch } from './MerchantSearch'
import { MerchantTable } from './MerchantTable'

type Merchant = {
  id: string
  name: string
  status: string
  businessType: string
  createdAtFormatted: string
}

type MerchantsListProps = {
  merchants: Merchant[]
  newMerchantButton: React.ReactNode
}

export function MerchantsList({ merchants, newMerchantButton }: MerchantsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [serverResults, setServerResults] = useState<Merchant[]>([])
  const [isSearchingServer, setIsSearchingServer] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Client-side filter first
  const clientFiltered = useMemo(() => {
    if (!searchQuery.trim()) {
      return merchants
    }
    const query = searchQuery.toLowerCase().trim()
    return merchants.filter((merchant) => merchant.name.toLowerCase().includes(query))
  }, [merchants, searchQuery])

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
          const response = await fetch(`/api/admin/merchants/search?q=${encodeURIComponent(trimmedQuery)}`)
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
    const unique = combined.filter((merchant, index, self) => 
      index === self.findIndex((m) => m.id === merchant.id)
    )
    return unique
  }, [clientFiltered, serverResults])

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <MerchantSearch value={searchQuery} onChange={setSearchQuery} />
        {newMerchantButton}
      </div>
      <MerchantTable 
        merchants={allResults} 
        searchQuery={searchQuery}
        isSearchingServer={isSearchingServer}
      />
    </>
  )
}
