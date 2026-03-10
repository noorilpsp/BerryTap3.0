'use client'

import { useTenant } from '@/lib/contexts/TenantContext'
import { useState, useEffect } from 'react'
import type { MerchantLocation } from '@/lib/db/schema/merchant-locations'

let locationsCache: { merchantId: string; data: MerchantLocation[] } | null = null

function getLocationsCache(merchantId: string | null): MerchantLocation[] | null {
  if (!merchantId || !locationsCache || locationsCache.merchantId !== merchantId) return null
  return locationsCache.data
}

function setLocationsCache(merchantId: string, data: MerchantLocation[]): void {
  locationsCache = { merchantId, data }
}

/**
 * Hook to fetch locations for the current merchant
 * Uses the current merchant ID from TenantContext
 */
export function useLocations() {
  const { currentMerchantId, loading: tenantLoading } = useTenant()
  const [locations, setLocations] = useState<MerchantLocation[]>(() =>
    getLocationsCache(currentMerchantId ?? null) ?? []
  )
  const [loading, setLoading] = useState(
    () => !!currentMerchantId && !tenantLoading && !getLocationsCache(currentMerchantId)
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for tenant to finish initializing
    if (tenantLoading) {
      return
    }

    // Ensure we have a valid merchant ID before fetching
    if (!currentMerchantId || currentMerchantId.trim() === '') {
      setLocations([])
      setError(null)
      setLoading(false)
      return
    }

    const cached = getLocationsCache(currentMerchantId)
    if (cached) {
      setLocations(cached)
      setLoading(false)
    }

    let cancelled = false

    async function fetchLocations(silent: boolean) {
      try {
        if (!silent) {
          setLoading(true)
          setError(null)
        }

        const validMerchantId = currentMerchantId?.trim()
        if (!validMerchantId) {
          setError('Invalid merchant ID')
          setLoading(false)
          return
        }

        const response = await fetch(`/api/locations?merchantId=${encodeURIComponent(validMerchantId)}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized - Please log in')
            return
          }
          if (response.status === 403) {
            setError("Forbidden - You don't have access to this merchant")
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch locations: ${response.status}`)
        }

        const data: MerchantLocation[] = await response.json()
        setLocationsCache(validMerchantId, data)

        if (!cancelled) {
          setLocations(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch locations')
          console.error('[useLocations] Error:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchLocations(!cached)

    return () => {
      cancelled = true
    }
  }, [currentMerchantId, tenantLoading])

  return {
    locations,
    loading,
    error,
  }
}
