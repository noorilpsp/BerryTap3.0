'use client'

import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { useIsAdmin } from '@/components/AdminPermissionsProvider'
import { Edit, Settings } from 'lucide-react'

type MerchantActionsProps = {
  merchantId: string
}

export function MerchantActions({ merchantId }: MerchantActionsProps) {
  const { isAdmin } = useIsAdmin()

  return (
    <div className="flex items-center gap-2">
      {/* Edit button - visible to platform admins */}
      {isAdmin && (
        <Button variant="outline" asChild>
          <Link href={`/admin/merchants/${merchantId}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </Button>
      )}

      {/* Settings button - visible to platform admins */}
      {isAdmin && (
        <Button variant="outline" asChild>
          <Link href={`/admin/merchants/${merchantId}/settings`}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </Button>
      )}
    </div>
  )
}
