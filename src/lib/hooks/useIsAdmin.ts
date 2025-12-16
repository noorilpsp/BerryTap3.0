'use client'

import { useEffect, useState } from 'react'

/**
 * Lightweight hook that fetches only platform admin status.
 * Returns a simple boolean instead of full permissions object.
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch on client side, after mount
    if (typeof window === 'undefined') return

    async function fetchAdminStatus() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/is-admin', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized - Please log in')
            setIsAdmin(false)
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch admin status: ${response.status}`)
        }

        const data = await response.json()
        setIsAdmin(data.isAdmin ?? false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin status')
        console.error('[useIsAdmin] Error:', err)
        setIsAdmin(false) // Default to false on error
      } finally {
        setLoading(false)
      }
    }

    // Defer fetch to next tick to avoid blocking navigation
    const timeoutId = setTimeout(() => {
      fetchAdminStatus()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/is-admin', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please log in')
          setIsAdmin(false)
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch admin status: ${response.status}`)
      }

      const data = await response.json()
      setIsAdmin(data.isAdmin ?? false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin status')
      console.error('[useIsAdmin] Error:', err)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return { isAdmin, loading, error, refetch }
}

