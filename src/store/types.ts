// Canonical types for the restaurant store (Option B: core table + reservations).

export type SectionId = "main" | "patio" | "bar" | "private"

export type StoreTableStatus =
  | "free"
  | "active"
  | "urgent"
  | "billing"
  | "closed"
  | "reserved"
  | "cleaning"

export type StoreTableShape = "round" | "square" | "rectangle" | "booth"

export type StoreMealStage = "drinks" | "food" | "dessert" | "bill"

export type StoreAlertType = "food_ready" | "no_checkin" | "waiting" | "kitchen_delay"

export type StoreTableDetailStatus =
  | "available"
  | "seated"
  | "ordering"
  | "in_kitchen"
  | "food_ready"
  | "served"
  | "bill_requested"
  | "needs_attention"

export type StoreOrderItemStatus = "held" | "sent" | "cooking" | "ready" | "served" | "void"
export type StoreOrderWaveType = "drinks" | "food" | "dessert"

export interface StoreOrderItem {
  id: string
  /** Menu item id when known; needed for addItemsToOrder sync. */
  menuItemId?: string
  name: string
  variant?: string
  mods?: string[]
  price: number
  status: StoreOrderItemStatus
  wave: StoreOrderWaveType
  waveNumber?: number
  eta?: number
  allergyAlert?: boolean
}

export interface StoreSeatState {
  number: number
  dietary: string[]
  notes: string[]
  items: StoreOrderItem[]
  /** From DB seats table when session loaded from database */
  guestName?: string | null
}

export interface StoreTableNoteState {
  text: string
  icon: string
}

export interface StoreTableBillState {
  subtotal: number
  tax: number
  total: number
}

export interface StoreTableSessionState {
  status: StoreTableDetailStatus
  guestCount: number
  lastCheckIn?: string
  pacing?: "quick" | "relaxed"
  notes: StoreTableNoteState[]
  seats: StoreSeatState[]
  tableItems: StoreOrderItem[]
  waveCount: number
  bill: StoreTableBillState
}

export type StoreOrderStatus = "open" | "closed"
export type StoreOrderWaveStatus = "held" | "sent" | "cooking" | "ready" | "served"
export type StoreOrderTimelineEventType = "opened" | "wave_status_changed" | "closed"

export interface StoreOrderWave {
  number: number
  status: StoreOrderWaveStatus
  itemCount: number
}

export interface StoreOrderTimelineEvent {
  type: StoreOrderTimelineEventType
  at: string
  waveNumber?: number
  fromStatus?: StoreOrderWaveStatus
  toStatus?: StoreOrderWaveStatus
}

export interface StoreOrder {
  id: string
  tableId: string
  tableNumber: number
  status: StoreOrderStatus
  openedAt: string
  updatedAt: string
  closedAt?: string
  guestCount: number
  waveCount: number
  waves: StoreOrderWave[]
  bill: StoreTableBillState
  session: StoreTableSessionState
  timeline: StoreOrderTimelineEvent[]
}

export interface StoreTable {
  id: string
  number: number
  /** Section id - may be legacy (patio|bar|main|private) or custom from floor plan sections */
  section: string
  capacity: number
  status: StoreTableStatus
  shape: StoreTableShape
  position: { x: number; y: number }
  guests?: number
  serverId?: string | null
  serverName?: string | null
  orderId?: string | null
  reservationId?: string | null
  seatedAt?: string | null
  stage?: StoreMealStage | null
  alerts?: StoreAlertType[]
  combinedWith?: string
  width?: number
  height?: number
  rotation?: number
  session?: StoreTableSessionState | null
  /** DB session id when table has an open session. Use for mutations (recordSessionEvent, closeSession, etc.). */
  sessionId?: string | null
}

export type StoreReservationStatus =
  | "reserved"
  | "confirmed"
  | "seated"
  | "completed"
  | "noShow"
  | "cancelled"
  | "late"
  | "waitlist"

export interface StoreReservationTimelineEvent {
  event: string
  time: string
  user: string
  avatar: string
}

export interface StoreReservationCustomerProfile {
  totalVisits: number
  lastVisit: string | null
  avgSpend: number
  favoriteItems: string[]
  preferences: string
  noShowCount: number
  cancelCount: number
}

export interface StoreReservation {
  id: string
  code: string
  guestName: string
  fullName: string
  partySize: number
  children?: number
  date: string
  time: string
  endTime?: string
  duration?: number
  status: StoreReservationStatus
  phone?: string
  email?: string
  table: string | null
  tableId: string | null
  zone: string | null
  staff: string | null
  staffId: string | null
  source?: string
  notes?: string
  specialRequests?: string
  dietaryNeeds?: string[]
  tags?: string[]
  isVIP?: boolean
  isRegular?: boolean
  visitCount?: number
  loyaltyTier?: string
  graceMinutes?: number
  minutesUntil?: number | null
  graceLeft?: number
  urgency?: string
  linkedOrderId?: string | null
  customerProfile?: StoreReservationCustomerProfile
  timeline?: StoreReservationTimelineEvent[]
}

export interface WaitlistEntry {
  id: string
  guestName: string
  partySize: number
  phone?: string
  addedAt: string
  waitTime: string
  notes?: string
}

export const SECTION_CONFIG: Record<SectionId, string> = {
  main: "Main Dining",
  patio: "Patio",
  bar: "Bar Area",
  private: "Private",
}
