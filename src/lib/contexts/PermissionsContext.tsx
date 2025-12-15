'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { usePermissions, type UserPermissions } from '@/lib/hooks/usePermissions'

type PermissionsContextType = {
  permissions: UserPermissions | null
  loading: boolean
  error: string | null
  refetch: () => void
  isPlatformAdmin: boolean
  hasMerchantAccess: (merchantId: string) => boolean
  canAccessLocation: (locationId: string) => boolean
  getUserRole: (merchantId: string) => 'owner' | 'admin' | 'manager' | null
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

// Internal component that only renders after mount to avoid blocking prerendering
function PermissionsProviderInner({ children }: { children: ReactNode }) {
  const { permissions, loading, error, refetch } = usePermissions()

  const isPlatformAdmin = permissions?.platformAdmin ?? false

  const hasMerchantAccess = (merchantId: string): boolean => {
    if (!permissions) return false
    return permissions.merchantMemberships.some(
      (m) => m.merchantId === merchantId,
    )
  }

  const canAccessLocation = (locationId: string): boolean => {
    if (!permissions) return false
    return permissions.merchantMemberships.some((membership) =>
      membership.accessibleLocations.some((loc) => loc.id === locationId),
    )
  }

  const getUserRole = (
    merchantId: string,
  ): 'owner' | 'admin' | 'manager' | null => {
    if (!permissions) return null
    const membership = permissions.merchantMemberships.find(
      (m) => m.merchantId === merchantId,
    )
    return membership?.role ?? null
  }

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        loading,
        error,
        refetch,
        isPlatformAdmin,
        hasMerchantAccess,
        canAccessLocation,
        getUserRole,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

// Default context value for SSR/prerendering
const defaultContextValue: PermissionsContextType = {
  permissions: null,
  loading: true,
  error: null,
  refetch: () => {},
  isPlatformAdmin: false,
  hasMerchantAccess: () => false,
  canAccessLocation: () => false,
  getUserRole: () => null,
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  // During SSR/prerendering (when window is undefined), use default values
  // This avoids triggering static analysis warnings with cacheComponents
  if (typeof window === 'undefined') {
    return (
      <PermissionsContext.Provider value={defaultContextValue}>
        {children}
      </PermissionsContext.Provider>
    )
  }

  // On client side, use the actual permissions hook
  return <PermissionsProviderInner>{children}</PermissionsProviderInner>
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider')
  }
  return context
}

