'use client'

import { ReactNode } from 'react'
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'

type PermissionButtonProps = ComponentProps<typeof Button> & {
  children: ReactNode
  requirePlatformAdmin?: boolean
  requireMerchantAccess?: string // merchantId
  requireLocationAccess?: string // locationId
  requireRole?: 'owner' | 'admin' | 'manager'
  merchantId?: string // For role check
  requireMinRole?: 'owner' | 'admin' | 'manager' // Minimum role required
  fallback?: ReactNode
  hideIfNoAccess?: boolean // Hide button instead of disabling
}

export function PermissionButton({
  children,
  requirePlatformAdmin,
  requireMerchantAccess,
  requireLocationAccess,
  requireRole,
  merchantId,
  requireMinRole,
  fallback,
  hideIfNoAccess = false,
  disabled,
  ...buttonProps
}: PermissionButtonProps) {
  const {
    permissions,
    loading,
    isPlatformAdmin,
    hasMerchantAccess,
    canAccessLocation,
    getUserRole,
  } = usePermissionsContext()

  // Show loading state or fallback while checking
  if (loading) {
    return fallback ?? null
  }

  if (!permissions) {
    return fallback ?? null
  }

  // Check platform admin requirement
  if (requirePlatformAdmin && !isPlatformAdmin) {
    return hideIfNoAccess ? null : (fallback ?? null)
  }

  // Check merchant access requirement
  if (requireMerchantAccess && !hasMerchantAccess(requireMerchantAccess)) {
    return hideIfNoAccess ? null : (fallback ?? null)
  }

  // Check location access requirement
  if (requireLocationAccess && !canAccessLocation(requireLocationAccess)) {
    return hideIfNoAccess ? null : (fallback ?? null)
  }

  // Check role requirement
  if (requireRole && merchantId) {
    const userRole = getUserRole(merchantId)
    if (userRole !== requireRole) {
      return hideIfNoAccess ? null : (fallback ?? null)
    }
  }

  // Check minimum role requirement
  if (requireMinRole && merchantId) {
    const userRole = getUserRole(merchantId)
    const roleHierarchy: Record<'owner' | 'admin' | 'manager', number> = {
      owner: 3,
      admin: 2,
      manager: 1,
    }

    if (
      !userRole ||
      roleHierarchy[userRole] < roleHierarchy[requireMinRole]
    ) {
      return hideIfNoAccess ? null : (fallback ?? null)
    }
  }

  return <Button disabled={disabled} {...buttonProps}>{children}</Button>
}

