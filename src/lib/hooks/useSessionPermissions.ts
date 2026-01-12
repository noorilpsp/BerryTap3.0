'use client'

import { useEffect, useState } from 'react'
import type { SessionPermissions } from '@/lib/types/permissions'

/**
 * Hook to fetch session permissions (lightweight initial load)
 * This replaces the old usePermissions hook with a more efficient approach
 */
export function useSessionPermissions() {
  const [permissions, setPermissions] = useState<SessionPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPermissions() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/session/permissions', {
          credentials: 'include',
          // Prevent browser caching to avoid cross-user data leaks
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized - Please log in')
            if (!cancelled) {
              setPermissions(null)
            }
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch permissions: ${response.status}`)
        }

        const data: SessionPermissions = await response.json()

        if (!cancelled) {
          // Debug: Log permissions data to help diagnose issues
          if (typeof window !== 'undefined') {
            console.log('[useSessionPermissions] Loaded permissions:', {
              userId: data.userId,
              merchantMembershipsCount: data.merchantMemberships.length,
              merchantMemberships: data.merchantMemberships,
            })
          }
          setPermissions(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
          console.error('[useSessionPermissions] Error:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    // Defer to next tick to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      fetchPermissions()
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/session/permissions', {
        credentials: 'include',
        // Prevent browser caching to avoid cross-user data leaks
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please log in')
          setPermissions(null)
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch permissions: ${response.status}`)
      }

      const data: SessionPermissions = await response.json()
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
      console.error('[useSessionPermissions] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { permissions, loading, error, refetch }
}