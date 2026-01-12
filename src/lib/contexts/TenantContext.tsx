'use client'

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { MerchantMembership } from '@/lib/types/permissions'

type TenantContextType = {
  currentMerchantId: string | null
  setCurrentMerchant: (merchantId: string) => void
  merchantMemberships: MerchantMembership[]
  loading: boolean
  getCurrentMembership: () => MerchantMembership | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({
  children,
  initialMerchants,
  userId,
}: {
  children: ReactNode
  initialMerchants: MerchantMembership[]
  userId: string
}) {
  const [currentMerchantId, setCurrentMerchantIdState] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    if (initialMerchants.length === 0) {
      setInitialized(true)
      return
    }

    const storageKey = `current_merchant_${userId}`
    const stored = localStorage.getItem(storageKey)

    // Validate stored merchant ID still exists in memberships
    let merchantIdToUse: string | null = null
    
    if (stored && stored.trim() !== '' && initialMerchants.some((m) => m.merchantId === stored)) {
      // Use stored ID if it's valid and exists in memberships
      merchantIdToUse = stored
    } else if (initialMerchants.length > 0) {
      // Fallback to first merchant if no valid stored ID
      const firstMerchantId = initialMerchants[0]?.merchantId
      if (firstMerchantId && firstMerchantId.trim() !== '') {
        merchantIdToUse = firstMerchantId
      }
    }

    // Set the merchant ID if we have a valid one
    if (merchantIdToUse && merchantIdToUse.trim() !== '') {
      setCurrentMerchantIdState(merchantIdToUse)
      
      // Sync to server cookie for SSR (optional)
      if (typeof document !== 'undefined') {
        document.cookie = `current_merchant=${merchantIdToUse}; path=/; max-age=2592000` // 30 days
      }
    } else {
      // No valid merchant ID found
      setCurrentMerchantIdState(null)
    }

    setInitialized(true)
  }, [initialMerchants, userId])

  const setCurrentMerchant = useCallback(
    (merchantId: string) => {
      // Validate merchant ID exists in memberships
      if (!initialMerchants.some((m) => m.merchantId === merchantId)) {
        console.warn(`Merchant ID ${merchantId} not found in memberships`)
        return
      }

      setCurrentMerchantIdState(merchantId)

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`current_merchant_${userId}`, merchantId)
        // Sync to cookie
        document.cookie = `current_merchant=${merchantId}; path=/; max-age=2592000` // 30 days
      }

      // Optionally sync to server via API
      // This could be done via a mutation or on next navigation
    },
    [initialMerchants, userId]
  )

  const getCurrentMembership = useCallback((): MerchantMembership | null => {
    if (!currentMerchantId) return null
    return initialMerchants.find((m) => m.merchantId === currentMerchantId) ?? null
  }, [currentMerchantId, initialMerchants])

  return (
    <TenantContext.Provider
      value={{
        currentMerchantId,
        setCurrentMerchant,
        merchantMemberships: initialMerchants,
        loading: !initialized,
        getCurrentMembership,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}