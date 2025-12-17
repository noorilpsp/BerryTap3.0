import { Link } from '@/components/ui/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MerchantActions } from './MerchantActions'

type Merchant = {
  id: string
  name: string
  legalName: string | null
  status: string
  businessType: string
}

type MerchantHeaderProps = {
  merchant: Merchant
}

export function MerchantHeader({ merchant }: MerchantHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/merchants">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back to merchants</span>
        </Link>
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{merchant.name}</h1>
          <Badge variant="outline" className="capitalize">
            {merchant.status}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {merchant.businessType}
          </Badge>
        </div>
        {merchant.legalName && (
          <p className="text-muted-foreground mt-1">{merchant.legalName}</p>
        )}
      </div>
      {merchant.id && <MerchantActions merchantId={merchant.id} />}
    </div>
  )
}
