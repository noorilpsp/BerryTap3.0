'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MerchantTableRow } from './MerchantTableRow'

type Merchant = {
  id: string
  name: string
  status: string
  businessType: string
  createdAtFormatted: string
}

type MerchantTableProps = {
  merchants: Merchant[]
  searchQuery: string
  isSearchingServer?: boolean
}

export function MerchantTable({ merchants, searchQuery, isSearchingServer = false }: MerchantTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isSearchingServer ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                Searching all merchants...
              </TableCell>
            </TableRow>
          ) : merchants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                No merchants found{searchQuery ? ` for "${searchQuery}"` : ''}.
              </TableCell>
            </TableRow>
          ) : (
            merchants.map((merchant) => (
              <MerchantTableRow key={merchant.id} merchant={merchant} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
