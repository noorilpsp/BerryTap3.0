// src/components/ClientPermissionsProvider.tsx
'use client'

import { PermissionsProvider } from '@/lib/contexts/PermissionsContext'

export function ClientPermissionsProvider({ children }: { children: React.ReactNode }) {
  return <PermissionsProvider>{children}</PermissionsProvider>
}