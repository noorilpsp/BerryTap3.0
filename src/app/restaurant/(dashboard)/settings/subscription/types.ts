export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "paused"
export type BillingInterval = "month" | "year"
export type PlanId = "starter" | "pro" | "enterprise"
export type InvoiceStatus = "paid" | "unpaid" | "void"
export type PaymentMethodType = "card" | "bank_account" | "sepa_debit"
export type PromoCodeType = "percent_off" | "amount_off" | "fixed_price"
export type CreditType = "referral" | "promo" | "refund" | "adjustment"

export interface Subscription {
  id: string
  planId: PlanId
  planName: string
  status: SubscriptionStatus
  billing: {
    amount: number
    currency: string
    interval: BillingInterval
    intervalCount: number
  }
  limits: {
    locations: number
    teamMembers: number
    orders: number | "unlimited"
    storage: number
    apiCalls: number
    emailCredits: number
  }
  features: string[]
  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate: string
  nextBillingAmount: number
  canceledAt?: string
  cancelAtPeriodEnd: boolean
  trialStart?: string
  trialEnd?: string
  createdAt: string
  updatedAt: string
}

export interface Usage {
  period: {
    start: string
    end: string
  }
  locations: {
    used: number
    limit: number
  }
  teamMembers: {
    used: number
    limit: number
  }
  orders: {
    used: number
    limit: number | "unlimited"
  }
  storage: {
    used: number
    limit: number
  }
  apiCalls: {
    used: number
    limit: number
  }
  emailCredits: {
    used: number
    limit: number
  }
}

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
    funding: "credit" | "debit"
  }
  billingDetails: {
    name: string
    email: string
    phone?: string
    address: {
      line1: string
      line2?: string
      city: string
      postalCode: string
      country: string
    }
  }
  isDefault: boolean
  addedBy: string
  addedByName: string
  createdAt: string
}

export interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  amount: number
  tax: number
  total: number
  currency: string
  status: InvoiceStatus
  description: string
  lineItems: Array<{
    description: string
    amount: number
  }>
  paidAt?: string
  paymentMethod?: string
  pdfUrl: string
}

export interface Plan {
  id: PlanId
  name: string
  price: number
  interval: BillingInterval
  description: string
  features: string[]
  limits: {
    locations: number | "unlimited"
    teamMembers: number | "unlimited"
    orders: number | "unlimited"
    storage: number
    apiCalls: number
    emailCredits: number
  }
  popular?: boolean
}
