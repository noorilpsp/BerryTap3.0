'use client'

import { ReactNode } from 'react'
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

type ConditionalRenderProps = {
  children: ReactNode
  requirePlatformAdmin?: boolean
  requireMerchantAccess?: string
  requireLocationAccess?: string
  requireRole?: 'owner' | 'admin' | 'manager'
  requireMinRole?: 'owner' | 'admin' | 'manager'
  merchantId?: string
  fallback?: ReactNode
  showLoading?: boolean
}

/**
 * Component that conditionally renders children based on permissions
 * Useful for showing/hiding entire sections of UI
 */
export function ConditionalRender({
  children,
  requirePlatformAdmin,
  requireMerchantAccess,
  requireLocationAccess,
  requireRole,
  requireMinRole,
  merchantId,
  fallback = null,
  showLoading = false,
}: ConditionalRenderProps) {
  const {
    permissions,
    loading,
    isPlatformAdmin,
    hasMerchantAccess,
    canAccessLocation,
    getUserRole,
  } = usePermissionsContext()

  if (loading && showLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!permissions) {
    return <>{fallback}</>
  }

  // Check platform admin requirement
  if (requirePlatformAdmin && !isPlatformAdmin) {
    return <>{fallback}</>
  }

  // Check merchant access requirement
  if (requireMerchantAccess && !hasMerchantAccess(requireMerchantAccess)) {
    return <>{fallback}</>
  }

  // Check location access requirement
  if (requireLocationAccess && !canAccessLocation(requireLocationAccess)) {
    return <>{fallback}</>
  }

  // Check exact role requirement
  if (requireRole && merchantId) {
    const userRole = getUserRole(merchantId)
    if (userRole !== requireRole) {
      return <>{fallback}</>
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
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

