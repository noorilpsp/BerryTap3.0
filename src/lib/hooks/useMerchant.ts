'use client'

import { useTenant } from '@/lib/contexts/TenantContext'
import { useCurrentMerchant } from '@/lib/hooks/useCurrentMerchant'

/**
 * Hook to get the current merchant ID and data
 * Uses the new tenant context system for merchant selection
 * 
 * @deprecated Consider using useCurrentMerchant directly for better type safety
 */
export function useMerchant() {
  const { currentMerchantId, loading: tenantLoading } = useTenant()
  const { merchant, loading: merchantLoading, error } = useCurrentMerchant()

  return {
    id: currentMerchantId,
    loading: tenantLoading || merchantLoading,
    error,
    merchant, // Full merchant data (lazy loaded)
  }
}
