'use client'

import { useEffect, useState } from 'react'

export type MerchantMembership = {
  merchantId: string
  merchantName: string
  merchantLegalName: string
  merchantStatus: string
  businessType: string
  role: 'owner' | 'admin' | 'manager'
  locationAccess: string[]
  permissions: Record<string, boolean>
  accessibleLocations: Array<{
    id: string
    name: string
    address: string
    city: string
    status: string
  }>
  allLocationsCount: number
  accessibleLocationsCount: number
  membershipCreatedAt: Date | string
}

export type UserPermissions = {
  userId: string
  platformAdmin: boolean
  merchantMemberships: MerchantMembership[]
  totalMerchants: number
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch on client side, after mount
    if (typeof window === 'undefined') return

    async function fetchPermissions() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/permissions', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized - Please log in')
            setLoading(false)
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch permissions: ${response.status}`)
        }

        const data = await response.json()
        setPermissions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
        console.error('[usePermissions] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Defer permissions fetch to next tick to avoid blocking navigation
    // This allows the page to render immediately while permissions load in background
    const timeoutId = setTimeout(() => {
      fetchPermissions()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/permissions', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please log in')
          setLoading(false)
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch permissions: ${response.status}`)
      }

      const data = await response.json()
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
      console.error('[usePermissions] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { permissions, loading, error, refetch }
}

