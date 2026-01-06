export interface BankAccount {
  bankAccountId: string
  accountHolder: string
  bankName: string
  ibanMasked: string
  ibanLast4: string
  bic: string
  currency: string
  status: "unverified" | "pending" | "verified" | "failed"
  verification: {
    method: "micro_deposits" | "instant"
    attempts: number
    maxAttempts: number
    lastAttemptAt?: string
    expiresAt?: string
    verifiedAt?: string
    verifiedBy?: string
    verifiedByName?: string
  }
  isDefault: boolean
  payoutSummary?: {
    totalReceived: number
    payoutCount: number
    lastPayoutDate?: string
    lastPayoutAmount?: number
    nextPayoutDate?: string
    nextPayoutAmount?: number
  }
  documents: Array<{
    type: "mandate" | "verification" | "statement"
    name: string
    url: string
    uploadedAt: string
  }>
  notes?: string
  addedBy: string
  addedByName: string
  addedAt: string
  updatedAt: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}

export interface BankEvent {
  eventId: string
  bankAccountId?: string
  type:
    | "account_added"
    | "account_verified"
    | "account_removed"
    | "default_set"
    | "verification_sent"
    | "verification_failed"
    | "payout_succeeded"
    | "payout_failed"
    | "funds_returned"
  message: string
  details?: {
    payoutId?: string
    amount?: number
    reason?: string
    previousDefault?: string
  }
  severity: "info" | "warning" | "error" | "success"
  actor?: string
  actorName?: string
  createdAt: string
}

export interface BankingSummary {
  defaultAccount?: {
    bankAccountId: string
    bankName: string
    ibanMasked: string
    accountHolder: string
    currency: string
  }
  nextPayout?: {
    date: string
    estimatedAmount: number
    currency: string
  }
  lastPayout?: {
    date: string
    amount: number
    status: "success" | "failed"
    payoutId: string
  }
  accountCount: number
  verifiedCount: number
  pendingCount: number
}
