import { Badge } from "@/components/ui/badge"
import { CreditCard, RotateCcw, DollarSign, Wrench, XCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { TransactionType, TransactionStatus, PaymentMethod, Channel } from "./data"

export function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case "charge":
      return <CreditCard className="h-4 w-4 text-blue-500" />
    case "refund":
      return <RotateCcw className="h-4 w-4 text-orange-500" />
    case "tip":
      return <DollarSign className="h-4 w-4 text-green-500" />
    case "adjustment":
      return <Wrench className="h-4 w-4 text-purple-500" />
    case "chargeback":
      return <XCircle className="h-4 w-4 text-red-500" />
  }
}

export function getStatusBadge(status: TransactionStatus) {
  switch (status) {
    case "succeeded":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Succeeded
        </Badge>
      )
    case "pending":
      return (
        <Badge
          variant="default"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      )
    case "refunded":
      return (
        <Badge
          variant="default"
          className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      )
    case "disputed":
      return (
        <Badge
          variant="default"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200"
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          Disputed
        </Badge>
      )
    case "settled":
      return (
        <Badge variant="secondary">
          <CheckCircle className="mr-1 h-3 w-3" />
          Settled
        </Badge>
      )
    case "partially_refunded":
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          Partial Refund
        </Badge>
      )
  }
}

export function getPaymentMethodDisplay(paymentMethod: PaymentMethod) {
  if (paymentMethod.type === "card" && paymentMethod.brand && paymentMethod.last4) {
    const brandDisplay = paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)
    return (
      <div className="space-y-1">
        <div className="text-sm font-medium">
          {brandDisplay} ••{paymentMethod.last4}
        </div>
        {paymentMethod.wallet && (
          <div className="text-xs text-muted-foreground">{paymentMethod.wallet.replace("_", " ")}</div>
        )}
      </div>
    )
  }

  if (paymentMethod.type === "cash") {
    return <span className="text-sm">Cash</span>
  }

  if (paymentMethod.type === "gift_card") {
    return <span className="text-sm">Gift Card</span>
  }

  return <span className="text-sm capitalize">{paymentMethod.type.replace("_", " ")}</span>
}

export function getChannelDisplay(channel: Channel) {
  const channelMap: Record<Channel, string> = {
    dine_in: "Dine-in",
    takeaway: "Takeaway",
    delivery: "Delivery",
    online: "Online",
    mobile_app: "Mobile App",
    kiosk: "Kiosk",
  }

  return <span className="text-sm">{channelMap[channel]}</span>
}
