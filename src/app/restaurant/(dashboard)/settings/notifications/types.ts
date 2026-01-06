export type NotificationChannel = {
  id: string
  name: string
  icon: string
  type: "email" | "sms" | "whatsapp" | "push" | "in-app" | "receipt"
  connected: boolean
  active: boolean
  provider: string
  status: "healthy" | "degraded" | "down" | "setup-required"
  sentToday: number
  failedToday: number
  deliveryRate: number
  lastTested?: {
    date: string
    by: string
    result: "success" | "failed"
  }
  config?: {
    apiKey?: string
    senderName?: string
    fromEmail?: string
    replyToEmail?: string
    rateLimit?: string
  }
}

export type NotificationTemplate = {
  id: string
  name: string
  description: string
  type: "order" | "reservation" | "receipt" | "inventory" | "staff" | "payment" | "marketing"
  channels: ("email" | "sms" | "whatsapp" | "push" | "in-app")[]
  active: boolean
  sentLast7Days: number
  updatedAt: string
  updatedBy: string
  subject?: string
  content: string
}

export type NotificationTrigger = {
  id: string
  event: string
  template: string
  channels: ("email" | "sms" | "whatsapp" | "push")[]
  active: boolean
  sentLast7Days: number
  successRate: number
  conditions?: string[]
}

export type DeliveryLog = {
  id: string
  type: string
  recipient: {
    name: string
    email?: string
    phone?: string
  }
  channels: {
    type: "email" | "sms" | "whatsapp" | "push"
    status: "delivered" | "pending" | "failed"
    sentAt?: string
    deliveredAt?: string
    error?: string
  }[]
  createdAt: string
  relatedOrder?: string
  relatedLocation?: string
}
