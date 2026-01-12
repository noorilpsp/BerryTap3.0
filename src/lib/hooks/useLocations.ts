'use client'

import { useTenant } from '@/lib/contexts/TenantContext'
import { useState, useEffect } from 'react'
import type { MerchantLocation } from '@/lib/db/schema/merchant-locations'

/**
 * Hook to fetch locations for the current merchant
 * Uses the current merchant ID from TenantContext
 */
export function useLocations() {
  const { currentMerchantId, loading: tenantLoading } = useTenant()
  const [locations, setLocations] = useState<MerchantLocation[]>([])
  const [loading, setLoading] = useState(false)
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

    // Fetch locations
    let cancelled = false

    async function fetchLocations() {
      try {
        setLoading(true)
        setError(null)

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

    fetchLocations()

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
