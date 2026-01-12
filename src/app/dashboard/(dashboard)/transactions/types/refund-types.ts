export interface RefundRequest {
  transactionId: string
  amount: number
  currency: string
  type: "full" | "partial"
  reason: string
  reasonDetail?: string
  destination: "original_method" | "store_credit" | "cash"
  storeCreditType?: "gift_card" | "loyalty_points" | "account_credit"
  managerPin?: string
  managerName?: string
  sendNotification: boolean
  includeReceipt: boolean
  itemsRefunded?: string[]
}

export interface RefundResponse {
  refundId: string
  transactionId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  destination: string
  processorRefundId?: string
  giftCardCode?: string
  createdAt: string
  completedAt?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface RefundValidation {
  valid: boolean
  errors: Array<{
    field: string
    message: string
  }>
  warnings: Array<{
    field: string
    message: string
  }>
  availableAmount: number
  requiresManagerAuth: boolean
  requiresAmountConfirmation: boolean
}

export interface RefundSettings {
  authorization: {
    requirePinOverAmount: number
    requirePinForFullRefunds: boolean
    fullRefundThreshold: number
    requirePinForCash: boolean
    requirePinAfterDays: number
  }
  confirmation: {
    requireAmountConfirmationOverAmount: number
    requireConfirmationForFullRefunds: boolean
    fullRefundConfirmationThreshold: number
  }
  limits: {
    maxDaysAfterTransaction: number
    requireApprovalAfterDays: number
    maxRefundPerStaffPerDay: number
    maxTotalRefundsPerDay?: number
  }
  notifications: {
    alwaysSendEmail: boolean
    includeReceipt: boolean
    sendSmsOverAmount: number
    ccManager: boolean
    managerEmail: string
  }
  storeCredit: {
    enabled: boolean
    offerAsOption: boolean
    bonusPercentage: number
    expirationDays: number | null
  }
}

export const REFUND_REASONS = [
  { value: "customer_request", label: "Customer Request" },
  { value: "wrong_item", label: "Wrong Item/Service" },
  { value: "quality_issue", label: "Quality Issue" },
  { value: "order_cancelled", label: "Order Cancelled" },
  { value: "overcharged", label: "Overcharged" },
  { value: "duplicate_charge", label: "Duplicate Charge" },
  { value: "out_of_stock", label: "Item Out of Stock" },
  { value: "service_unsatisfactory", label: "Service Not Satisfactory" },
  { value: "late_delivery", label: "Late Delivery" },
  { value: "other", label: "Other (specify below)" },
]

export const DEFAULT_REFUND_SETTINGS: RefundSettings = {
  authorization: {
    requirePinOverAmount: 100,
    requirePinForFullRefunds: true,
    fullRefundThreshold: 40,
    requirePinForCash: true,
    requirePinAfterDays: 30,
  },
  confirmation: {
    requireAmountConfirmationOverAmount: 500,
    requireConfirmationForFullRefunds: true,
    fullRefundConfirmationThreshold: 200,
  },
  limits: {
    maxDaysAfterTransaction: 90,
    requireApprovalAfterDays: 30,
    maxRefundPerStaffPerDay: 200,
  },
  notifications: {
    alwaysSendEmail: true,
    includeReceipt: true,
    sendSmsOverAmount: 50,
    ccManager: true,
    managerEmail: "manager@berrytap.com",
  },
  storeCredit: {
    enabled: true,
    offerAsOption: true,
    bonusPercentage: 10,
    expirationDays: null,
  },
}
