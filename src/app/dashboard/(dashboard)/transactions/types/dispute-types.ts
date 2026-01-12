export interface Dispute {
  disputeId: string
  transactionId: string
  chargebackId?: string

  type: "chargeback" | "inquiry" | "pre_arbitration"
  status: "received" | "evidence_required" | "submitted" | "under_review" | "won" | "lost" | "expired"

  amount: number
  currency: string
  disputeFee: number

  reason: string
  reasonCode: string
  reasonDescription: string

  cardholderClaim: string
  cardholderEvidence?: string[]

  network: "visa" | "mastercard" | "amex" | "discover"
  caseId?: string

  initiatedAt: string
  responseDeadline: string
  expectedDecisionDate?: string
  decidedAt?: string

  evidence: DisputeEvidence[]
  timeline: DisputeEvent[]

  winProbability?: number
  winProbabilityFactors?: Array<{
    factor: string
    impact: number
    present: boolean
  }>

  recommendations?: DisputeRecommendation[]

  outcome?: {
    result: "won" | "lost"
    reason: string
    networkNotes?: string
    amountReturned?: number
    feeCharged?: number
    decidedAt: string
  }

  submittedBy?: string
  submittedByName?: string
  submittedAt?: string

  notifications: Array<{
    type: string
    sentTo: string
    sentAt: string
    status: string
  }>
}

export interface DisputeEvidence {
  evidenceId: string
  disputeId: string

  type:
    | "receipt"
    | "signature"
    | "delivery_confirmation"
    | "communication"
    | "photos"
    | "tracking"
    | "terms"
    | "refund_policy"
    | "account_history"
    | "ip_address"
    | "avs_cvv"
    | "purchase_history"
    | "other"

  files: Array<{
    fileId: string
    filename: string
    fileType: string
    fileSize: number
    url: string
    uploadedAt: string
    uploadedBy: string
  }>

  description?: string

  createdAt: string
  createdBy: string
  createdByName: string
}

export interface DisputeEvent {
  eventId: string
  disputeId: string

  event:
    | "received"
    | "notification_sent"
    | "amount_held"
    | "evidence_uploaded"
    | "response_submitted"
    | "response_acknowledged"
    | "outcome_received"
    | "amount_released"
    | "amount_debited"

  description: string
  actor: string
  actorName?: string

  metadata?: Record<string, any>

  createdAt: string
}

export interface DisputeRecommendation {
  recommendationId: string

  priority: "high" | "medium" | "low"
  impact: number

  title: string
  description: string

  actionType: "auto_generate" | "manual_upload" | "manual_input"
  actionLabel: string

  available: boolean
  completed: boolean

  evidenceType?: string
}

export interface DisputeSettings {
  notifications: {
    emailAddresses: string[]
    smsNumbers: string[]
    notifyOnNew: boolean
    notifyOnDeadline: boolean
    deadlineWarningDays: number
    notifyOnOutcome: boolean
  }

  automation: {
    autoGenerateReports: boolean
    autoSubmitEvidence: boolean
    requireApprovalBeforeSubmit: boolean
  }

  evidence: {
    maxFileSize: number
    maxFiles: number
    allowedFileTypes: string[]
  }
}

export interface DisputeSummary {
  activeDisputes: number
  awaitingResponse: number
  underReview: number
  thisMonth: number
  monthlyWinRate: number

  amountAtRisk: number
  potentialFees: number
  wonLast30Days: {
    count: number
    amount: number
  }
  lostLast30Days: {
    count: number
    amount: number
  }
}
