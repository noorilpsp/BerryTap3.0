export type DocumentType = "privacy_policy" | "terms_of_service" | "dpa" | "cookie_policy" | "acceptable_use" | "other"

export type DocumentStatus = "active" | "draft" | "superseded" | "archived"

export interface LegalDocument {
  id: string
  type: DocumentType
  title: string
  version: string
  status: DocumentStatus
  uploadedDate: string
  uploadedBy: string
  effectiveDate: string
  validUntil?: string
  description: string
  compliance: string[]
  fileUrl?: string
  fileSize?: string
}

export interface DocumentVersion {
  version: string
  uploadedDate: string
  uploadedBy: string
  effectiveDate: string
  validUntil?: string
  status: DocumentStatus
  changes: string[]
}

export type DataType =
  | "customer_pii"
  | "payment_data"
  | "order_history"
  | "email_communications"
  | "analytics_data"
  | "audit_logs"

export interface RetentionPolicy {
  id: string
  dataType: DataType
  displayName: string
  includes: string
  retentionPeriod: string
  autoDelete: boolean
  status: "active" | "inactive"
  lastReviewed: string
  nextReview: string
}

export type PrivacyRequestType = "data_export" | "data_deletion" | "data_access" | "data_rectification"

export type PrivacyRequestStatus = "pending" | "approved" | "rejected" | "completed"

export interface PrivacyRequest {
  id: string
  type: PrivacyRequestType
  requester: string
  email: string
  customerId?: string
  submittedDate: string
  dueDate: string
  status: PrivacyRequestStatus
  legalBasis: string
  requestedData?: string[]
  warnings?: string[]
  notes?: string
}

export interface ComplianceChecklist {
  name: string
  items: ComplianceCheckItem[]
  status: "complete" | "partial" | "incomplete"
  completedCount: number
  totalCount: number
  lastAudit?: string
  nextAudit?: string
  certificate?: {
    valid: boolean
    validUntil?: string
    lastScan?: string
    nextScan?: string
  }
}

export interface ComplianceCheckItem {
  id: string
  label: string
  completed: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  category: string
  user: string
  userRole: string
  details: string
  ipAddress?: string
  location?: string
  relatedId?: string
}
