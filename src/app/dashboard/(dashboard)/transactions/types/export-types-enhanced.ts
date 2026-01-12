// Enhanced Export Configuration Types
export interface ExportConfiguration {
  exportId: string
  name: string
  description?: string

  dataRange: {
    type: "current_filters" | "custom" | "selected" | "all"
    dateFrom?: string
    dateTo?: string
    filters?: any
    estimatedRows: number
  }

  columns: Array<{
    field: string
    label: string
    order: number
    format?: string
  }>

  format: {
    type: "csv" | "xlsx" | "pdf" | "json"
    options: {
      // CSV
      delimiter?: "," | ";" | "\t" | "|"
      encoding?: "utf-8" | "iso-8859-1"
      includeBOM?: boolean

      // Excel
      includeFormatting?: boolean
      includeSummarySheet?: boolean

      // PDF
      orientation?: "portrait" | "landscape"
      pageSize?: "A4" | "Letter" | "Legal"

      // JSON
      prettyPrint?: boolean
    }
    dateFormat?: string
    timezone?: string
    numberFormat?: {
      decimalSeparator: "." | ","
      thousandsSeparator: boolean
      currencySymbol?: string
    }
  }

  privacy: {
    redactCardNumbers: boolean
    redactEmails: boolean
    redactPhones: boolean
    includeMetadata: boolean
  }

  delivery: {
    downloadCenter: boolean
    email?: {
      recipients: string[]
      cc?: string[]
      subject: string
      message: string
    }
    cloudStorage?: {
      provider: "google_drive" | "dropbox" | "s3"
      folder: string
    }
  }

  createdAt: string
  createdBy: string
}

export interface ScheduledExport {
  scheduleId: string
  name: string
  description?: string

  configuration: ExportConfiguration

  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom"
    time: string // HH:mm
    timezone: string
    dayOfWeek?: number // 0-6 (Sunday-Saturday)
    dayOfMonth?: number // 1-31
    customCron?: string
  }

  dataRange: {
    type: "yesterday" | "today" | "last_7_days" | "last_30_days" | "current_month" | "previous_month" | "custom"
    customRange?: {
      from: string
      to: string
    }
  }

  status: "active" | "paused"
  pausedBy?: string
  pausedAt?: string
  pauseReason?: string

  startDate: string
  endDate?: string
  maxOccurrences?: number

  lastRun?: {
    runAt: string
    status: "success" | "failed"
    jobId: string
    rows?: number
    fileSize?: number
    error?: string
  }

  nextRun?: string

  notifications: {
    onComplete: boolean
    onFailure: boolean
    weeklySummary: boolean
  }

  runHistory: Array<{
    runAt: string
    status: "success" | "failed"
    jobId: string
    rows?: number
    fileSize?: number
    duration?: number
    error?: string
  }>

  createdAt: string
  createdBy: string
  createdByName: string
}

export interface ColumnOption {
  field: string
  label: string
  category: string
  enabled: boolean
}

export const availableColumns: ColumnOption[] = [
  // Transaction Info
  { field: "transactionId", label: "Transaction ID", category: "Transaction Info", enabled: true },
  { field: "transactionDate", label: "Transaction Date", category: "Transaction Info", enabled: true },
  { field: "transactionTime", label: "Transaction Time", category: "Transaction Info", enabled: true },
  { field: "type", label: "Type", category: "Transaction Info", enabled: true },
  { field: "status", label: "Status", category: "Transaction Info", enabled: true },
  { field: "amountGross", label: "Amount (Gross)", category: "Transaction Info", enabled: true },
  { field: "fees", label: "Fees", category: "Transaction Info", enabled: true },
  { field: "netAmount", label: "Net Amount", category: "Transaction Info", enabled: true },
  { field: "currency", label: "Currency", category: "Transaction Info", enabled: true },
  { field: "paymentMethod", label: "Payment Method", category: "Transaction Info", enabled: true },
  { field: "channel", label: "Channel", category: "Transaction Info", enabled: true },
  { field: "orderId", label: "Order ID", category: "Transaction Info", enabled: true },

  // Payment Details
  { field: "cardBrand", label: "Card Brand", category: "Payment Details", enabled: false },
  { field: "cardLast4", label: "Card Last 4", category: "Payment Details", enabled: false },
  { field: "cardholderName", label: "Cardholder Name", category: "Payment Details", enabled: false },
  { field: "authCode", label: "Auth Code", category: "Payment Details", enabled: false },

  // Customer Info
  { field: "customerName", label: "Customer Name", category: "Customer Info", enabled: false },
  { field: "customerEmail", label: "Customer Email", category: "Customer Info", enabled: false },
  { field: "customerPhone", label: "Customer Phone", category: "Customer Info", enabled: false },
  { field: "loyaltyTier", label: "Loyalty Tier", category: "Customer Info", enabled: false },

  // Location
  { field: "locationName", label: "Location Name", category: "Location", enabled: false },
  { field: "terminalId", label: "Terminal ID", category: "Location", enabled: false },

  // Processor
  { field: "processorName", label: "Processor Name", category: "Processor", enabled: false },
  { field: "processorId", label: "Processor ID", category: "Processor", enabled: false },
  { field: "payoutId", label: "Payout ID", category: "Processor", enabled: false },

  // Metadata
  { field: "staffMember", label: "Staff Member", category: "Metadata", enabled: false },
  { field: "shift", label: "Shift", category: "Metadata", enabled: false },
  { field: "tags", label: "Tags", category: "Metadata", enabled: false },
  { field: "notes", label: "Notes", category: "Metadata", enabled: false },
]
