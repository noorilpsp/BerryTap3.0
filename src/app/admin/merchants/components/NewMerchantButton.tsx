'use client'

import { Link } from '@/components/ui/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsAdmin } from '@/components/AdminPermissionsProvider'

export function NewMerchantButton() {
  const { isAdmin, loading } = useIsAdmin()

  // Only platform admins can create merchants
  if (loading || !isAdmin) {
    return null
  }

  return (

    
    <Button asChild>
      <Link 
        prefetch={true}
        href="/admin/merchants/new" 
        className="gap-2"
      >
        <Plus className="size-4" />
        New merchant
      </Link>
    </Button>
  )
}
