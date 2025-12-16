'use client'

import { useRouter } from 'next/navigation'
import { Link } from '@/components/ui/link'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { useIsAdmin } from '@/components/AdminPermissionsProvider'

type Merchant = {
  id: string
  name: string
  status: string
  businessType: string
  createdAtFormatted: string
}

type MerchantTableRowProps = {
  merchant: Merchant
}

export function MerchantTableRow({ merchant }: MerchantTableRowProps) {
  const router = useRouter()
  const { isAdmin } = useIsAdmin()

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
        router.push(`/admin/merchants/${merchant.id}`)
      }}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/merchants/${merchant.id}`}
            className="font-medium hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {merchant.name}
          </Link>
          {isAdmin && (
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {merchant.status}
        </Badge>
      </TableCell>
      <TableCell className="capitalize">{merchant.businessType}</TableCell>
      <TableCell>{merchant.createdAtFormatted}</TableCell>
    </TableRow>
  )
}
