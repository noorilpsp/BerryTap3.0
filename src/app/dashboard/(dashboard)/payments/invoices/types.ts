export type InvoiceStatus = "paid" | "unpaid" | "past_due" | "void" | "refunded" | "pending"
export type InvoiceType = "subscription" | "one_off" | "credit"
export type PaymentMethod = "auto_charge" | "manual" | "failed" | "n/a"

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceId: string
  date: Date
  dueDate: Date
  paidDate?: Date
  type: InvoiceType
  typeDescription: string
  status: InvoiceStatus
  amount: number
  currency: string
  paymentMethod: string
  paymentMethodType: PaymentMethod
  cardLast4?: string
  reviewed: boolean
  reviewedBy?: string
  reviewedAt?: Date
  reviewNote?: string

  // Bill to information
  billTo: {
    businessName: string
    location?: string
    address: string
    city: string
    postalCode: string
    country: string
    vatId?: string
    contact: string
    email: string
  }

  // Line items
  lineItems: {
    description: string
    details?: string
    quantity: number
    unitPrice: number
    total: number
  }[]

  // Totals
  subtotal: number
  tax: number
  taxRate: number
  credits: number
  total: number
  amountPaid: number
  balance: number

  // Billing period
  periodStart?: Date
  periodEnd?: Date

  // Payment details
  transactionId?: string
  paymentFailureReason?: string
  lastAttemptDate?: Date

  // Additional info
  notes?: string
  lateFee?: number
  daysOverdue?: number
}

export interface InvoiceFilters {
  search: string
  type: InvoiceType[]
  status: InvoiceStatus[]
  dateRange: "last_30" | "last_90" | "last_12_months" | "this_year" | "all_time" | "custom"
  dateFrom?: Date
  dateTo?: Date
  reviewed: "all" | "reviewed" | "not_reviewed"
}

export interface InvoiceKPIs {
  totalDue: number
  pastDueCount: number
  pastDueAmount: number
  lastInvoice: {
    date: Date
    number: string
    amount: number
    status: InvoiceStatus
  } | null
  thisMonth: {
    amount: number
    count: number
    paid: boolean
  }
  nextDueDate?: Date
}
