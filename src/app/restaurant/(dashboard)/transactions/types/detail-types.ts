export interface TimelineEvent {
  event: string
  timestamp: string
  actor: string
  details: string
  status?: "pending" | "completed" | "failed"
}

export interface RefundDetail {
  refundId: string
  status: "pending" | "completed" | "failed"
  amount: number
  reason: string
  reasonDescription?: string
  processedBy: string
  processedByEmail?: string
  createdAt: string
  completedAt?: string
  destination: string
  destinationDetails?: string
  receiptUrl?: string
}

export interface ChargebackDetail {
  chargebackId: string
  status: "in_review" | "won" | "lost" | "accepted"
  type: "chargeback" | "inquiry"
  reason: string
  reasonCode: string
  cardholderClaim: string
  amount: number
  disputeFee: number
  initiatedAt: string
  responseDeadline: string
  expectedOutcome?: string
  evidenceSubmitted: Array<{
    type: string
    submitted: boolean
    name?: string
  }>
  timeline: TimelineEvent[]
  winProbability?: number
}

export interface Note {
  noteId: string
  type: "internal" | "public"
  content: string
  author: string
  authorId: string
  authorRole?: string
  createdAt: string
  pinned?: boolean
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

export interface TransactionDetail {
  transactionId: string
  type: "charge" | "refund" | "tip" | "adjustment" | "chargeback"
  status: "succeeded" | "pending" | "failed" | "refunded" | "disputed" | "partially_refunded"
  amount: number
  currency: string
  fees: number
  net: number

  // Fee breakdown
  feeBreakdown: {
    baseRate: number
    baseRatePercentage: number
    fixedFee: number
    effectiveRate: number
    additionalFees?: Array<{
      name: string
      amount: number
    }>
  }

  // Payment method
  paymentMethod: {
    type: string
    brand?: string
    last4?: string
    cardholderName?: string
    expMonth?: number
    expYear?: number
    funding?: "credit" | "debit" | "prepaid"
    country?: string
    wallet?: "apple_pay" | "google_pay"
  }

  // Order details
  order?: {
    orderId: string
    orderNumber: string
    tableNumber?: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    subtotal: number
    tax: number
    tip: number
    total: number
    customer?: {
      customerId: string
      name: string
      email: string
      phone: string
      loyaltyTier?: string
      loyaltyPoints?: number
    }
    server?: {
      staffId: string
      name: string
      role: string
    }
    shift?: string
  }

  // Location
  location?: {
    locationId: string
    name: string
    address: string
  }

  // Terminal
  terminal?: {
    terminalId: string
    name: string
    type: string
  }

  // Channel
  channel: string

  // Processor
  processor: {
    provider: string
    processorId: string
    paymentIntentId?: string
    payoutId?: string
    authCode?: string
    riskScore?: number
    riskLevel?: "low" | "medium" | "high"
    fraudDetection?: "passed" | "failed" | "review"
    threeDSecure?: boolean
    rawResponse?: Record<string, any>
  }

  // Timeline
  timeline: TimelineEvent[]

  // Refunds
  refunds: RefundDetail[]

  // Chargebacks
  chargebacks: ChargebackDetail[]

  // Metadata
  metadata: {
    staffId?: string
    staffName?: string
    shift?: string
    tags: string[]
    notes: Note[]
    customFields?: Record<string, string>
  }

  // Receipt
  receipt?: {
    sent: boolean
    sentTo?: string
    sentAt?: string
    deliveryStatus?: "delivered" | "bounced" | "pending"
    receiptUrl?: string
  }

  // Related transactions
  relatedTransactions?: {
    sameOrder?: string[]
    sameCustomer?: {
      count: number
      total: number
      last30Days: Array<{
        transactionId: string
        amount: number
        date: string
      }>
    }
    sameCard?: {
      count: number
      total: number
      last90Days: Array<{
        transactionId: string
        amount: number
        date: string
      }>
    }
  }

  // Dates
  createdAt: string
  updatedAt: string
  settledAt?: string
  expectedPayoutDate?: string
}
