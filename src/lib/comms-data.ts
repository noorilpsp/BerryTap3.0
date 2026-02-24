// ── Types ────────────────────────────────────────────────────────────────

export type MessageDirection = "in" | "out"
export type MessageChannel = "sms" | "email"
export type DeliveryStatus = "queued" | "sent" | "delivered" | "failed"

export interface Message {
  id: string
  direction: MessageDirection
  channel: MessageChannel
  template?: string
  templateName?: string
  recipient?: string
  sender?: string
  phone?: string
  content: string
  subject?: string
  timestamp: string
  status?: DeliveryStatus
  read?: boolean
  autoAction?: string | null
  actionNeeded?: string | null
  reservationId?: string
  // Bulk fields
  recipients?: number
  batchCount?: number
  stats?: {
    sent?: number
    delivered?: number
    opened?: number
    clicked?: number
    confirmed?: number
    cancelled?: number
    noResponse?: number
  }
  // Reply threading
  replyTo?: string
  replyContent?: string
  replyTimestamp?: string
}

export interface Template {
  id: string
  name: string
  channel: MessageChannel
  category: string
  body: string
  variables: string[]
  usedCount: number
  active: boolean
  confirmRate?: number
  cancelAfterRate?: number
  responseRate?: number
  rebookRate?: number
  bookingConversion?: number
}

export type FlowStatus = "active" | "paused"

export interface FlowStep {
  id: string
  type: "trigger" | "action" | "wait" | "condition"
  label: string
  branches?: { label: string; outcome: string }[]
}

export interface AutomationFlow {
  id: string
  name: string
  trigger: string
  triggerLabel: string
  status: FlowStatus
  triggeredCount: number
  successRate?: number
  cancelRate?: number
  responseRate?: number
  rebookRate?: number
  bookingConversion?: number
  steps: FlowStep[]
}

export interface WeeklyDataPoint {
  week: string
  sent: number
  delivered: number
  read: number
}

export interface AnalyticsData {
  totalSent: number
  deliveryRate: number
  readRate: number
  confirmRate: number
  avgReplyTime: number
  channelBreakdown: { sms: number; email: number }
  smsReadRate: number
  emailOpenRate: number
  weeklyData: WeeklyDataPoint[]
  templatePerformance: {
    name: string
    sent: number
    delivered: number
    deliveryPct: number
    read: number
    actionLabel: string
    actionPct: string
  }[]
}

// ── Category Labels ──────────────────────────────────────────────────────

export const categoryLabels: Record<string, string> = {
  reservation: "Reservation Flow",
  waitlist: "Waitlist",
  post_visit: "Post-Visit",
  re_engagement: "Re-Engagement",
  special: "Special Occasions",
}

// ── Mock Data ────────────────────────────────────────────────────────────

export const todaysMessages: Message[] = [
  {
    id: "msg_001",
    direction: "out",
    channel: "sms",
    template: "table_ready",
    templateName: "Table Ready",
    recipient: "Sarah Chen",
    phone: "+1 (555) 123-4567",
    content:
      "Hi Sarah, your table is ready! We're at the front waiting for you. See you soon!",
    timestamp: "2025-01-17T19:28:00",
    status: "delivered",
    read: false,
    reservationId: "res_001",
  },
  {
    id: "msg_002",
    direction: "in",
    channel: "sms",
    sender: "Kim Family",
    phone: "+1 (555) 234-5678",
    content: "Running 5 min late, sorry!",
    timestamp: "2025-01-17T19:25:00",
    autoAction: "Tagged reservation as 'running late'",
    reservationId: "res_kim",
  },
  {
    id: "msg_003",
    direction: "out",
    channel: "sms",
    template: "reminder",
    templateName: "Reminder",
    recipient: "Rivera",
    phone: "+1 (555) 345-6789",
    content:
      "Reminder: Your table at Chez Laurent is tonight at 8:00 PM, party of 2. We look forward to seeing you!",
    timestamp: "2025-01-17T12:00:00",
    status: "delivered",
    read: true,
  },
  {
    id: "msg_004",
    direction: "out",
    channel: "sms",
    template: "confirmation",
    templateName: "Confirmation",
    recipient: "Anderson",
    phone: "+1 (555) 456-7890",
    content:
      "Hi Anderson, your reservation at Chez Laurent is confirmed for Fri Jan 17 at 8:00 PM, party of 6. Reply C to confirm or X to cancel.",
    timestamp: "2025-01-17T11:30:00",
    status: "delivered",
    read: true,
    replyTo: "msg_005",
    replyContent: "C",
    replyTimestamp: "2025-01-17T11:45:00",
    autoAction: "Auto-confirmed reservation",
  },
  {
    id: "msg_006",
    direction: "out",
    channel: "sms",
    template: "confirmation",
    templateName: "Confirmation",
    recipient: "Patel",
    phone: "+1 (555) 789-0123",
    content:
      "Hi Patel, your reservation at Chez Laurent is confirmed for tonight...",
    timestamp: "2025-01-17T11:30:00",
    status: "delivered",
    read: true,
    replyTo: "msg_007",
    replyContent: "X",
    replyTimestamp: "2025-01-17T12:05:00",
    actionNeeded: "Cancellation request -- needs confirmation",
  },
  {
    id: "msg_008",
    direction: "out",
    channel: "sms",
    template: "confirmation",
    templateName: "Confirmation",
    recipient: "Baker",
    phone: "+1 (555) 567-8901",
    content: "Hi Baker, your reservation is confirmed...",
    timestamp: "2025-01-17T11:30:00",
    status: "delivered",
    read: false,
    actionNeeded: "High risk -- no confirmation received",
  },
  {
    id: "msg_009",
    direction: "out",
    channel: "email",
    template: "weekly_specials",
    templateName: "Weekly Specials",
    recipients: 12,
    subject: "This Weekend at Chez Laurent: Chef's Winter Menu",
    content:
      "This weekend at Chez Laurent: Chef's Winter Menu featuring seasonal ingredients...",
    timestamp: "2025-01-17T10:00:00",
    stats: { sent: 12, delivered: 11, opened: 8, clicked: 2 },
  },
  {
    id: "msg_010",
    direction: "out",
    channel: "sms",
    template: "confirmation",
    templateName: "Confirmation Batch",
    batchCount: 8,
    content: "Batch: 8 confirmation SMS sent for tonight's dinner service",
    timestamp: "2025-01-17T11:30:00",
    stats: {
      sent: 8,
      delivered: 8,
      confirmed: 6,
      cancelled: 1,
      noResponse: 1,
    },
  },
]

export const templates: Template[] = [
  {
    id: "tmpl_001",
    name: "Confirmation",
    channel: "sms",
    category: "reservation",
    body: "Hi {guest_name}, your reservation at {restaurant} is confirmed for {date} at {time}, party of {party_size}. Reply C to confirm or X to cancel.",
    variables: ["guest_name", "restaurant", "date", "time", "party_size"],
    usedCount: 847,
    confirmRate: 0.94,
    active: true,
  },
  {
    id: "tmpl_002",
    name: "Day-of Reminder",
    channel: "sms",
    category: "reservation",
    body: "Reminder: Your table at {restaurant} is tonight at {time}. We look forward to seeing you!",
    variables: ["restaurant", "time"],
    usedCount: 623,
    cancelAfterRate: 0.02,
    active: true,
  },
  {
    id: "tmpl_003",
    name: "Table Ready",
    channel: "sms",
    category: "reservation",
    body: "Hi {guest_name}, your table is ready! We're at the front waiting for you. See you soon!",
    variables: ["guest_name"],
    usedCount: 412,
    active: true,
  },
  {
    id: "tmpl_004",
    name: "Running Late Check-in",
    channel: "sms",
    category: "reservation",
    body: "Hi {guest_name}, we're holding your table at {time}. Are you still joining us tonight? Reply Y or N.",
    variables: ["guest_name", "time"],
    usedCount: 156,
    responseRate: 0.78,
    active: true,
  },
  {
    id: "tmpl_005",
    name: "Waitlist Added",
    channel: "sms",
    category: "waitlist",
    body: "Hi {guest_name}, you're on the waitlist at {restaurant}. Estimated wait: {wait_time}. We'll text when your table is ready!",
    variables: ["guest_name", "restaurant", "wait_time"],
    usedCount: 234,
    active: true,
  },
  {
    id: "tmpl_006",
    name: "Waitlist Table Ready",
    channel: "sms",
    category: "waitlist",
    body: "Great news {guest_name}! Your table is ready. Please head to the host stand. See you in a moment!",
    variables: ["guest_name"],
    usedCount: 198,
    active: true,
  },
  {
    id: "tmpl_007",
    name: "Thank You",
    channel: "sms",
    category: "post_visit",
    body: "Thank you for dining with us, {guest_name}! We hope you enjoyed your evening. See you again soon!",
    variables: ["guest_name"],
    usedCount: 389,
    active: true,
  },
  {
    id: "tmpl_008",
    name: "No-Show Follow-Up",
    channel: "sms",
    category: "post_visit",
    body: "Hi {guest_name}, we missed you tonight! If something came up, no worries. We'd love to rebook when you're ready -- just reply to this text.",
    variables: ["guest_name"],
    usedCount: 42,
    rebookRate: 0.24,
    active: true,
  },
  {
    id: "tmpl_009",
    name: "We Miss You",
    channel: "email",
    category: "re_engagement",
    body: "It's been a while, {guest_name}! We have some exciting new additions to our menu...",
    variables: ["guest_name"],
    usedCount: 35,
    active: true,
  },
  {
    id: "tmpl_010",
    name: "Birthday Wish",
    channel: "sms",
    category: "special",
    body: "Happy birthday, {guest_name}! Celebrate with us -- we'd love to make your day special. Book a table and enjoy a complimentary dessert!",
    variables: ["guest_name"],
    usedCount: 18,
    bookingConversion: 0.44,
    active: true,
  },
]

export const automationFlows: AutomationFlow[] = [
  {
    id: "flow_001",
    name: "Reservation Confirmation",
    trigger: "reservation_created",
    triggerLabel: "Reservation Created",
    status: "active",
    triggeredCount: 847,
    successRate: 0.94,
    steps: [
      { id: "s1", type: "trigger", label: "Reservation Created" },
      { id: "s2", type: "action", label: "Send SMS Confirmation" },
      { id: "s3", type: "wait", label: "Wait for reply (24h)" },
      {
        id: "s4",
        type: "condition",
        label: "Check Reply",
        branches: [
          { label: 'Reply "C"', outcome: "Confirm reservation" },
          { label: 'Reply "X"', outcome: "Cancel reservation" },
          { label: "No reply", outcome: "Send follow-up" },
        ],
      },
    ],
  },
  {
    id: "flow_002",
    name: "Day-of Reminder",
    trigger: "6_hours_before",
    triggerLabel: "6 Hours Before Reservation",
    status: "active",
    triggeredCount: 623,
    cancelRate: 0.02,
    steps: [
      { id: "s1", type: "trigger", label: "Day of reservation, 6h before" },
      { id: "s2", type: "action", label: "Send SMS Reminder" },
    ],
  },
  {
    id: "flow_003",
    name: "Late Guest Check-in",
    trigger: "guest_10min_late",
    triggerLabel: "Guest 10+ min Late",
    status: "active",
    triggeredCount: 156,
    responseRate: 0.78,
    steps: [
      { id: "s1", type: "trigger", label: "Guest 10+ min late, not arrived" },
      { id: "s2", type: "action", label: 'Send SMS "Still coming?"' },
      { id: "s3", type: "wait", label: "Wait 15 min for reply" },
      {
        id: "s4",
        type: "condition",
        label: "Check Reply",
        branches: [
          { label: 'Reply "Y"', outcome: "Update ETA, hold table" },
          { label: 'Reply "N"', outcome: "Cancel, release table" },
          { label: "No reply", outcome: "Alert host to decide" },
        ],
      },
    ],
  },
  {
    id: "flow_004",
    name: "Post-Visit Thank You",
    trigger: "check_paid_departed",
    triggerLabel: "Check Paid & Guest Departed",
    status: "active",
    triggeredCount: 389,
    steps: [
      { id: "s1", type: "trigger", label: "Guest check paid + departed" },
      { id: "s2", type: "wait", label: "Wait 2 hours" },
      { id: "s3", type: "action", label: 'Send SMS "Thank you"' },
    ],
  },
  {
    id: "flow_005",
    name: "No-Show Follow-Up",
    trigger: "marked_no_show",
    triggerLabel: "Reservation Marked No-Show",
    status: "active",
    triggeredCount: 42,
    rebookRate: 0.24,
    steps: [
      { id: "s1", type: "trigger", label: "Reservation marked no-show" },
      { id: "s2", type: "wait", label: "Wait 1 hour" },
      { id: "s3", type: "action", label: 'Send SMS "We missed you"' },
    ],
  },
  {
    id: "flow_006",
    name: "Birthday Outreach",
    trigger: "birthday_7_days",
    triggerLabel: "Guest Birthday in 7 Days",
    status: "active",
    triggeredCount: 18,
    bookingConversion: 0.44,
    steps: [
      { id: "s1", type: "trigger", label: "Guest birthday in 7 days" },
      { id: "s2", type: "action", label: 'Send SMS "Happy Birthday"' },
      { id: "s3", type: "wait", label: "Wait for booking (7d)" },
      {
        id: "s4",
        type: "condition",
        label: "Check Booking",
        branches: [
          { label: "Guest books", outcome: "Tag as birthday reservation" },
          { label: "No booking", outcome: "No action" },
        ],
      },
    ],
  },
  {
    id: "flow_007",
    name: "Re-Engagement",
    trigger: "inactive_60_days_regular",
    triggerLabel: "Guest Inactive 60+ Days (Regular)",
    status: "paused",
    triggeredCount: 35,
    steps: [
      {
        id: "s1",
        type: "trigger",
        label: "Guest inactive 60+ days, was regular",
      },
      { id: "s2", type: "action", label: 'Send Email "We Miss You"' },
    ],
  },
]

export const analyticsData: AnalyticsData = {
  totalSent: 1247,
  deliveryRate: 0.962,
  readRate: 0.824,
  confirmRate: 0.713,
  avgReplyTime: 12,
  channelBreakdown: { sms: 1127, email: 120 },
  smsReadRate: 0.84,
  emailOpenRate: 0.74,
  weeklyData: [
    { week: "W1", sent: 289, delivered: 278, read: 231 },
    { week: "W2", sent: 312, delivered: 301, read: 258 },
    { week: "W3", sent: 298, delivered: 287, read: 242 },
    { week: "W4", sent: 348, delivered: 335, read: 283 },
  ],
  templatePerformance: [
    {
      name: "Confirmation",
      sent: 312,
      delivered: 308,
      deliveryPct: 99,
      read: 284,
      actionLabel: "confirm",
      actionPct: "94%",
    },
    {
      name: "Day-of Reminder",
      sent: 298,
      delivered: 294,
      deliveryPct: 99,
      read: 261,
      actionLabel: "cancel",
      actionPct: "2%",
    },
    {
      name: "Table Ready",
      sent: 189,
      delivered: 186,
      deliveryPct: 98,
      read: 142,
      actionLabel: "--",
      actionPct: "--",
    },
    {
      name: "Late Check-in",
      sent: 67,
      delivered: 65,
      deliveryPct: 97,
      read: 52,
      actionLabel: "respond",
      actionPct: "78%",
    },
    {
      name: "Thank You",
      sent: 201,
      delivered: 198,
      deliveryPct: 98,
      read: 168,
      actionLabel: "--",
      actionPct: "--",
    },
    {
      name: "No-Show Follow-Up",
      sent: 42,
      delivered: 41,
      deliveryPct: 98,
      read: 28,
      actionLabel: "rebook",
      actionPct: "24%",
    },
    {
      name: "Birthday",
      sent: 18,
      delivered: 18,
      deliveryPct: 100,
      read: 16,
      actionLabel: "book",
      actionPct: "44%",
    },
    {
      name: "Weekly Specials",
      sent: 120,
      delivered: 112,
      deliveryPct: 93,
      read: 89,
      actionLabel: "click",
      actionPct: "12%",
    },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function getTodayStats() {
  const sent = todaysMessages.filter((m) => m.direction === "out").length
  const delivered = todaysMessages.filter(
    (m) => m.direction === "out" && m.status === "delivered"
  ).length
  const read = todaysMessages.filter(
    (m) => m.direction === "out" && m.read === true
  ).length
  const replies = todaysMessages.filter((m) => m.direction === "in").length
  return { sent: 47, delivered: 44, read: 38, replies: 6 }
}

export const allVariables = [
  "guest_name",
  "restaurant",
  "date",
  "time",
  "party_size",
  "table",
  "server",
  "wait_time",
  "booking_link",
  "cancel_link",
]
