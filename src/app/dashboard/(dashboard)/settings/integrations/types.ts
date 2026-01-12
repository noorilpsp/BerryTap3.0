export type IntegrationCategory = "payment" | "delivery" | "messaging" | "accounting" | "analytics"
export type IntegrationStatus = "connected" | "not_connected" | "setup_needed" | "error"
export type WebhookStatus = "pending" | "success" | "failed"

export interface Integration {
  id: string
  key: string
  name: string
  category: IntegrationCategory
  description: string
  status: IntegrationStatus
  provider: string
  logo: string
  config?: {
    apiKey?: string
    accountId?: string
    mode?: "test" | "live"
    [key: string]: any
  }
  features: {
    name: string
    enabled: boolean
  }[]
  stats?: {
    todayCount: number
    todayValue?: number
    successRate: number
  }
  lastSyncAt?: string
  lastSyncStatus?: "success" | "failed"
  webhookUrl?: string
  webhookEvents?: string[]
  connectedAt?: string
  connectedBy?: string
  connectedByName?: string
  documentation?: string
  supportUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Webhook {
  id: string
  name?: string
  description?: string
  url: string
  events: string[]
  secret?: string
  customHeaders?: { [key: string]: string }
  retryConfig: {
    enabled: boolean
    maxAttempts: number
    strategy: "linear" | "exponential"
  }
  timeout: number
  enabled: boolean
  stats: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    successRate: number
  }
  lastDeliveryAt?: string
  lastDeliveryStatus?: "success" | "failed"
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  request: {
    method: string
    url: string
    headers: { [key: string]: string }
    body: any
  }
  response?: {
    status: number
    statusText: string
    headers?: { [key: string]: string }
    body?: any
    time: number
  }
  attempts: number
  maxAttempts: number
  status: WebhookStatus
  error?: {
    code: string
    message: string
  }
  retryHistory?: Array<{
    attempt: number
    timestamp: string
    status: string
    error?: string
  }>
  metadata?: {
    orderId?: string
    customerId?: string
    [key: string]: any
  }
  createdAt: string
}

export interface SyncLog {
  id: string
  integrationId: string
  integrationName: string
  type: "manual" | "automatic" | "scheduled"
  status: "running" | "success" | "failed"
  itemsSynced: number
  itemsFailed: number
  duration: number
  error?: {
    code: string
    message: string
  }
  startedAt: string
  completedAt?: string
}
