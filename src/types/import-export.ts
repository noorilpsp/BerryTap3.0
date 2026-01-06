export type ExportFormat = "xlsx" | "csv" | "pdf" | "json"

export type PDFTemplate = "classic" | "modern" | "minimalist"

export interface ExportOptions {
  format: ExportFormat
  includeItems: boolean
  includeCategories: boolean
  includeCustomizations: boolean
  includePricing: boolean
  includePhotos: boolean
  includeAnalytics: boolean
  applyCurrentFilters: boolean
  menus: string[]
  statuses: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  pdfOptions?: {
    template: PDFTemplate
    includePhotos: boolean
    includePrices: boolean
    includeDescriptions: boolean
    includeQRCode: boolean
    paperSize: "letter" | "a4"
  }
}

export interface ImportFile {
  name: string
  size: string
  rows: number
  columns: string[]
  data: any[]
}

export interface ColumnMapping {
  sourceColumn: string
  targetField: string
  preview: string
}

export interface ValidationIssue {
  row: number
  severity: "error" | "warning" | "success"
  item: string
  issue: string
  suggestion: string
  field?: string
}

export interface ImportProgress {
  current: number
  total: number
  status:
    | "validating"
    | "creating-categories"
    | "importing-items"
    | "processing-images"
    | "finalizing"
    | "complete"
    | "error"
  message: string
  items: Array<{
    name: string
    status: "success" | "warning" | "error"
    message?: string
  }>
}
