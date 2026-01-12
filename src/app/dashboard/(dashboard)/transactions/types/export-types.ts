import type { TransactionFilters } from "../data"

export type ExportFormat = "csv" | "xlsx" | "pdf" | "json"
export type ExportStatus = "queued" | "processing" | "completed" | "failed" | "cancelled"
export type ReportCategory = "financial" | "reconciliation" | "tax" | "analytics" | "custom"

export interface ExportColumn {
  field: string
  label: string
  order: number
  format?: string
}

export interface ExportConfiguration {
  exportId: string
  name: string
  description?: string

  dataRange: {
    type: "current_filters" | "custom" | "selected" | "all"
    dateFrom?: string
    dateTo?: string
    filters?: TransactionFilters
    estimatedRows: number
  }

  columns: ExportColumn[]

  format: {
    type: ExportFormat
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

export interface ExportJob {
  jobId: string
  exportId?: string
  configuration: ExportConfiguration

  status: ExportStatus
  progress?: number // 0-100

  estimatedRows: number
  processedRows?: number

  startedAt?: string
  completedAt?: string
  estimatedDuration?: number // seconds

  result?: {
    fileUrl: string
    filename: string
    fileSize: number
    actualRows: number
    expiresAt: string
    downloadCount: number
  }

  error?: {
    code: string
    message: string
    details?: string
  }

  createdAt: string
  createdBy: string
  createdByName: string
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

export interface ReportTemplate {
  templateId: string
  name: string
  description: string
  category: ReportCategory

  configuration: ExportConfiguration

  isSystem: boolean // System templates can't be deleted
  isPublic: boolean // Available to all users

  usageCount: number
  lastUsedAt?: string

  createdAt: string
  createdBy: string
  createdByName: string
}
