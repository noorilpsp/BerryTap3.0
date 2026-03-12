import type { ReactNode } from "react"

import { OpsProviders } from "@/components/ops-providers"

/**
 * Shared ops layout. Keeps PermissionsProvider, TenantProvider, LocationProvider
 * mounted across ops route navigation (floor-map, table, builder, tables, etc.)
 * so we avoid re-triggering permissions and locations fetches on every switch.
 */
export default function OpsLayout({ children }: { children: ReactNode }) {
  return <OpsProviders>{children}</OpsProviders>
}
