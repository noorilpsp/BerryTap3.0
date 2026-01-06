export type TransactionType = "charge" | "refund" | "tip" | "adjustment" | "chargeback"
export type TransactionStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "refunded"
  | "disputed"
  | "settled"
  | "partially_refunded"

export type PaymentMethodType = "card" | "cash" | "gift_card" | "wallet" | "bank"
export type CardBrand = "visa" | "mastercard" | "amex" | "discover"
export type Channel = "dine_in" | "takeaway" | "delivery" | "online" | "mobile_app" | "kiosk"

export interface PaymentMethod {
  type: PaymentMethodType
  brand?: CardBrand
  last4?: string
  wallet?: "apple_pay" | "google_pay"
}

export interface Transaction {
  transactionId: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  fees: number
  net: number
  paymentMethod: PaymentMethod
  channel: Channel
  orderId?: string
  customerId?: string
  customerEmail?: string
  customerPhone?: string
  locationId: string
  locationName?: string
  terminalId?: string
  processor: {
    provider: "stripe" | "square" | "toast" | "manual"
    processorId?: string
    payoutId?: string
  }
  metadata: {
    staffId?: string
    staffName?: string
    shift?: "morning" | "afternoon" | "evening" | "night"
    tags?: string[]
    notes?: string
  }
  createdAt: string
  updatedAt: string
  settledAt?: string
}

export interface TransactionFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  datePreset?: string
  status?: TransactionStatus[]
  type?: TransactionType[]
  channel?: Channel[]
  paymentMethod?: PaymentMethodType[]
  cardBrand?: CardBrand[]
  cardLast4?: string
  locationId?: string[]
  terminalId?: string
  amountMin?: number
  amountMax?: number
  customerId?: string
  customerEmail?: string
  orderId?: string
  processorProvider?: string[]
  processorId?: string
  payoutId?: string
  staffId?: string
  shift?: string[]
  tags?: string[]
  payoutStatus?: string[]
}

export interface TransactionSummary {
  totalVolume: number
  grossAmount: number
  fees: number
  netAmount: number
  refundAmount: number
  refundCount: number
  failedCount: number
  disputedCount: number
  successRate: number
  comparisonPeriod: {
    volumeChange: number
    amountChange: number
  }
  byType: Record<string, number>
  byChannel: Record<string, number>
  byPaymentMethod: Record<string, number>
}

// Mock data generator
export const mockTransactions: Transaction[] = Array.from({ length: 150 }, (_, i) => {
  const types: TransactionType[] = ["charge", "refund", "tip", "adjustment", "chargeback"]
  const statuses: TransactionStatus[] = ["succeeded", "pending", "failed", "refunded", "disputed"]
  const channels: Channel[] = ["dine_in", "takeaway", "delivery", "online"]
  const cardBrands: CardBrand[] = ["visa", "mastercard", "amex", "discover"]

  const type = types[Math.floor(Math.random() * types.length)]
  const status = type === "charge" ? statuses[Math.floor(Math.random() * 3)] : "succeeded"
  const amount = type === "refund" ? -(Math.random() * 50 + 5) : Math.random() * 200 + 10
  const fees = status === "succeeded" ? Math.abs(amount) * 0.03 : 0
  const net = Math.abs(amount) - fees
  const cardBrand = cardBrands[Math.floor(Math.random() * cardBrands.length)]

  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 90)
  const hoursAgo = Math.floor(Math.random() * 24)
  const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)

  return {
    transactionId: `tx_${String(i + 1).padStart(4, "0")}`,
    type,
    status,
    amount: Math.abs(amount),
    currency: "EUR",
    fees,
    net,
    paymentMethod: {
      type: "card",
      brand: cardBrand,
      last4: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
    },
    channel: channels[Math.floor(Math.random() * channels.length)],
    orderId: `ord_${String(Math.floor(Math.random() * 5000) + 1000).padStart(4, "0")}`,
    customerId: `cus_${String(Math.floor(Math.random() * 500) + 1).padStart(3, "0")}`,
    customerEmail: `customer${i}@example.com`,
    customerPhone: `+356 ${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
    locationId: `loc_0${Math.floor(Math.random() * 3) + 1}`,
    locationName: ["Valletta Main", "Sliema Branch", "Airport"][Math.floor(Math.random() * 3)],
    terminalId: `term_${String(Math.floor(Math.random() * 10) + 1).padStart(2, "0")}`,
    processor: {
      provider: ["stripe", "square", "toast"][Math.floor(Math.random() * 3)] as "stripe" | "square" | "toast",
      processorId: `ch_${Math.random().toString(36).substr(2, 9)}`,
      payoutId: Math.random() > 0.5 ? `po_${Math.random().toString(36).substr(2, 9)}` : undefined,
    },
    metadata: {
      staffId: `staff_${Math.floor(Math.random() * 20) + 1}`,
      staffName: ["John Doe", "Jane Smith", "Mike Wilson", "Sarah Johnson"][Math.floor(Math.random() * 4)],
      shift: ["morning", "afternoon", "evening", "night"][Math.floor(Math.random() * 4)] as
        | "morning"
        | "afternoon"
        | "evening"
        | "night",
      tags: Math.random() > 0.7 ? ["high-value"] : undefined,
    },
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    settledAt: Math.random() > 0.3 ? createdAt.toISOString() : undefined,
  }
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export function calculateSummary(transactions: Transaction[]): TransactionSummary {
  const totalVolume = transactions.length
  const grossAmount = transactions.reduce((sum, t) => sum + (t.type === "refund" ? 0 : t.amount), 0)
  const fees = transactions.reduce((sum, t) => sum + t.fees, 0)
  const netAmount = grossAmount - fees
  const refundAmount = transactions.filter((t) => t.type === "refund").reduce((sum, t) => sum + t.amount, 0)
  const refundCount = transactions.filter((t) => t.type === "refund").length
  const failedCount = transactions.filter((t) => t.status === "failed").length
  const disputedCount = transactions.filter((t) => t.status === "disputed").length
  const successRate = totalVolume > 0 ? ((totalVolume - failedCount) / totalVolume) * 100 : 0

  const byType: Record<string, number> = {}
  const byChannel: Record<string, number> = {}
  const byPaymentMethod: Record<string, number> = {}

  transactions.forEach((t) => {
    byType[t.type] = (byType[t.type] || 0) + 1
    byChannel[t.channel] = (byChannel[t.channel] || 0) + t.amount
    byPaymentMethod[t.paymentMethod.type] = (byPaymentMethod[t.paymentMethod.type] || 0) + 1
  })

  return {
    totalVolume,
    grossAmount: Number(grossAmount.toFixed(2)),
    fees: Number(fees.toFixed(2)),
    netAmount: Number(netAmount.toFixed(2)),
    refundAmount: Number(refundAmount.toFixed(2)),
    refundCount,
    failedCount,
    disputedCount,
    successRate: Number(successRate.toFixed(1)),
    comparisonPeriod: {
      volumeChange: 12.3,
      amountChange: 8.9,
    },
    byType,
    byChannel,
    byPaymentMethod,
  }
}
