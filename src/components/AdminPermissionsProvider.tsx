'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useIsAdmin as useIsAdminHook } from '@/lib/hooks/useIsAdmin'

type AdminContextType = {
  isAdmin: boolean | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

/**
 * Lightweight provider that only manages platform admin status.
 * Wraps admin routes to provide isAdmin check without fetching full permissions.
 */
export function AdminPermissionsProvider({ children }: { children: ReactNode }) {
  const { isAdmin, loading, error, refetch } = useIsAdminHook()

  return (
    <AdminContext.Provider value={{ isAdmin, loading, error, refetch }}>
      {children}
    </AdminContext.Provider>
  )
}

/**
 * Hook to access admin status in admin routes.
 * Only available within AdminPermissionsProvider.
 */
export function useIsAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useIsAdmin must be used within AdminPermissionsProvider')
  }
  return context
}

