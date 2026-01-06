export type PayoutStatus = "paid" | "pending" | "failed"

export interface Payout {
  payoutId: string
  status: PayoutStatus
  settledAt: string // ISO timestamp - when processor settled
  bankArrivalAt: string | null // ISO timestamp - when deposited
  estimatedArrivalAt?: string // For pending payouts
  grossAmount: number // Total before fees
  feesAmount: number // Processor fees
  netAmount: number // Amount deposited (gross - fees)
  currency: string
  locationId: string
  locationName: string
  transactionCount: number
  transactionDateRange: {
    from: string
    to: string
  }
  reconciled: boolean
  reconciledAt?: string
  reconciledBy?: string
  reconciledByName?: string
  note?: string
  bankAccount: {
    last4: string
    bankName: string
    method: string
  }
  processor: {
    name: string
    processorId: string
    reference: string
  }
  error?: {
    code: string
    message: string
    time: string
  }
  createdAt: string
  updatedAt: string
}

export interface PayoutsResponse {
  data: Payout[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasMore: boolean
  }
  summary: {
    totalPayouts: number
    totalDeposited: number
    pendingAmount: number
    averagePayout: number
    paidCount: number
    pendingCount: number
    failedCount: number
    reconciledCount: number
  }
}

export interface PayoutFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  datePreset?: string
  locationId?: string[]
  status?: PayoutStatus[]
  reconciled?: boolean
}
