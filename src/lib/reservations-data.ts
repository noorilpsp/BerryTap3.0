// ── Reservations Dashboard Data ──────────────────────────────────────────────

export type ReservationStatus =
  | "confirmed"
  | "seated"
  | "completed"
  | "no-show"
  | "cancelled"
  | "late"

export type RiskLevel = "low" | "medium" | "high"

export type ServicePeriod = "breakfast" | "lunch" | "dinner" | "brunch" | "half-day" | "all-day"

export type TagType =
  | "vip"
  | "first-timer"
  | "birthday"
  | "anniversary"
  | "allergy"
  | "high-value"
  | "wheelchair"
  | "window"

export interface GuestTag {
  type: TagType
  label: string
  detail?: string
}

export interface Reservation {
  id: string
  guestName: string
  partySize: number
  time: string // "HH:MM" format
  status: ReservationStatus
  risk: RiskLevel
  riskScore?: number // percentage for high-risk
  table: string | null // e.g., "T12" or null for unassigned
  tags: GuestTag[]
  notes?: string
  visitCount?: number
  bookedVia?: string
  confirmationSent?: boolean
  phone?: string
}

export interface WaitlistParty {
  id: string
  name: string
  partySize: number
  quotedWait: number // minutes
  elapsedWait: number // minutes
  autoMatch?: string // predicted table
  autoMatchTime?: number // minutes until available
  barTab?: number // dollar amount
  notes?: string
}

export type CourseStage =
  | "ordering"
  | "appetizers"
  | "mains-fired"
  | "mains-served"
  | "dessert"
  | "check-requested"
  | "check-printed"
  | "paying"

export interface OccupiedTable {
  id: string
  tableNumber: string
  partySize: number
  courseStage: CourseStage
  predictedTurnMin: number
  mealProgressPct: number
  noDessertOrdered?: boolean
  seatedAt: string // time string
}

export interface CapacitySlot {
  time: string
  occupancyPct: number
  seatsOccupied: number
  totalSeats: number
  arrivingReservations: number
  predictedTurns: number
}

export interface PaceMetrics {
  revenue: number
  revenueTarget: number
  covers: number
  coversExpected: number
  avgTurnMin: number
  avgTurnTarget: number
  kitchenTickets: number
  kitchenLoad: "low" | "moderate" | "high" | "critical"
}

// ── Restaurant Configuration ─────────────────────────────────────────────────

export const restaurantConfig = {
  name: "Bella Vista",
  totalTables: 22,
  totalSeats: 78,
  zones: [
    { id: "main", name: "Main Dining", tables: 14 },
    { id: "patio", name: "Patio", tables: 5 },
    { id: "private", name: "Private Room", tables: 3 },
  ],
  servicePeriods: [
    { id: "lunch" as ServicePeriod, label: "Lunch", start: "11:30", end: "14:30" },
    { id: "dinner" as ServicePeriod, label: "Dinner", start: "17:00", end: "23:00" },
    { id: "half-day" as ServicePeriod, label: "12h", start: "12:00", end: "24:00" },
    { id: "all-day" as ServicePeriod, label: "24h", start: "00:00", end: "24:00" },
  ],
  currentTime: "19:23",
  currentDate: "Friday, Jan 17, 2025",
}

// ── Mock Reservations (18 total) ─────────────────────────────────────────────

export const reservations: Reservation[] = [
  {
    id: "r1",
    guestName: "James & Olivia Hart",
    partySize: 2,
    time: "17:30",
    status: "completed",
    risk: "low",
    table: "T1",
    tags: [{ type: "anniversary", label: "Anniversary" }],
    notes: "Window seat preferred",
    visitCount: 8,
    bookedVia: "Phone",
    confirmationSent: true,
  },
  {
    id: "r2",
    guestName: "Priya Sharma",
    partySize: 2,
    time: "18:00",
    status: "completed",
    risk: "low",
    table: "T3",
    tags: [{ type: "vip", label: "VIP" }, { type: "allergy", label: "Allergy", detail: "Gluten-free" }],
    visitCount: 24,
    bookedVia: "App",
    confirmationSent: true,
  },
  {
    id: "r3",
    guestName: "David Kim",
    partySize: 3,
    time: "18:00",
    status: "completed",
    risk: "low",
    table: "T5",
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "Google",
    confirmationSent: true,
  },
  {
    id: "r4",
    guestName: "The Okonkwo Family",
    partySize: 4,
    time: "18:30",
    status: "seated",
    risk: "low",
    table: "T8",
    tags: [{ type: "birthday", label: "Birthday" }, { type: "high-value", label: "High value" }],
    notes: "Cake delivery at 8pm",
    visitCount: 3,
    bookedVia: "Phone",
    confirmationSent: true,
  },
  {
    id: "r5",
    guestName: "Elena & Marco Rossi",
    partySize: 4,
    time: "18:30",
    status: "seated",
    risk: "low",
    table: "T9",
    tags: [{ type: "vip", label: "VIP" }, { type: "allergy", label: "Allergy", detail: "Shellfish" }],
    visitCount: 15,
    bookedVia: "App",
    confirmationSent: true,
  },
  {
    id: "r6",
    guestName: "Nguyen Family",
    partySize: 6,
    time: "19:00",
    status: "seated",
    risk: "low",
    table: "T14",
    tags: [{ type: "birthday", label: "Birthday" }, { type: "allergy", label: "Allergy", detail: "Nut allergy" }],
    notes: "Cake requested - chocolate",
    visitCount: 5,
    bookedVia: "Phone",
    confirmationSent: true,
  },
  {
    id: "r7",
    guestName: "Liam Walsh",
    partySize: 2,
    time: "19:00",
    status: "seated",
    risk: "low",
    table: "T2",
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "Google",
    confirmationSent: true,
  },
  {
    id: "r8",
    guestName: "Tanaka Business Group",
    partySize: 4,
    time: "19:15",
    status: "seated",
    risk: "low",
    table: "T15",
    tags: [{ type: "vip", label: "VIP" }, { type: "high-value", label: "High value" }],
    notes: "Private room preferred - business dinner",
    visitCount: 11,
    bookedVia: "Concierge",
    confirmationSent: true,
  },
  {
    id: "r9",
    guestName: "Sarah Chen",
    partySize: 4,
    time: "19:30",
    status: "confirmed",
    risk: "low",
    table: "T12",
    tags: [
      { type: "vip", label: "VIP" },
      { type: "allergy", label: "Allergy", detail: "Shellfish" },
    ],
    visitCount: 12,
    bookedVia: "App",
    confirmationSent: true,
    phone: "+1 (555) 234-5678",
  },
  {
    id: "r10",
    guestName: "Marcus Webb",
    partySize: 2,
    time: "19:30",
    status: "confirmed",
    risk: "medium",
    table: "T5",
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "Google",
    confirmationSent: false,
    phone: "+1 (555) 876-5432",
  },
  {
    id: "r11",
    guestName: "Amara Osei",
    partySize: 3,
    time: "19:45",
    status: "confirmed",
    risk: "low",
    table: "T6",
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "OpenTable",
    confirmationSent: true,
    phone: "+1 (555) 345-6789",
  },
  {
    id: "r12",
    guestName: "Jake Morrison",
    partySize: 4,
    time: "19:45",
    status: "confirmed",
    risk: "high",
    riskScore: 68,
    table: null,
    tags: [],
    bookedVia: "Website",
    confirmationSent: false,
    phone: "+1 (555) 987-6543",
  },
  {
    id: "r13",
    guestName: "Sofia Reyes",
    partySize: 2,
    time: "20:00",
    status: "confirmed",
    risk: "low",
    table: "T3",
    tags: [{ type: "window", label: "Window seat" }],
    notes: "Proposing tonight - please coordinate with staff",
    visitCount: 6,
    bookedVia: "Phone",
    confirmationSent: true,
    phone: "+1 (555) 456-7890",
  },
  {
    id: "r14",
    guestName: "Chen Wei Group",
    partySize: 8,
    time: "20:00",
    status: "confirmed",
    risk: "low",
    table: "T16",
    tags: [{ type: "high-value", label: "High value" }],
    notes: "Wheelchair accessible needed",
    visitCount: 2,
    bookedVia: "Phone",
    confirmationSent: true,
    phone: "+1 (555) 567-8901",
  },
  {
    id: "r15",
    guestName: "Isla McAllister",
    partySize: 2,
    time: "20:15",
    status: "confirmed",
    risk: "medium",
    table: "T4",
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "Instagram",
    confirmationSent: true,
    phone: "+1 (555) 678-9012",
  },
  {
    id: "r16",
    guestName: "Patel Celebration",
    partySize: 6,
    time: "20:30",
    status: "confirmed",
    risk: "low",
    table: "T14",
    tags: [{ type: "birthday", label: "Birthday" }, { type: "allergy", label: "Allergy", detail: "Dairy-free" }],
    notes: "Cake delivery arranged",
    visitCount: 4,
    bookedVia: "Phone",
    confirmationSent: true,
    phone: "+1 (555) 789-0123",
  },
  {
    id: "r17",
    guestName: "Tom & Rachel Davis",
    partySize: 4,
    time: "21:00",
    status: "confirmed",
    risk: "medium",
    table: null,
    tags: [],
    bookedVia: "Google",
    confirmationSent: false,
    phone: "+1 (555) 890-1234",
  },
  {
    id: "r18",
    guestName: "Aiko Yamamoto",
    partySize: 2,
    time: "21:30",
    status: "confirmed",
    risk: "high",
    riskScore: 55,
    table: null,
    tags: [{ type: "first-timer", label: "First timer" }],
    bookedVia: "Website",
    confirmationSent: false,
    phone: "+1 (555) 901-2345",
  },
]

// ── Mock Waitlist (5 parties) ────────────────────────────────────────────────

export const waitlistParties: WaitlistParty[] = [
  {
    id: "w1",
    name: "Rodriguez family",
    partySize: 4,
    quotedWait: 25,
    elapsedWait: 18,
    autoMatch: "T14",
    autoMatchTime: 7,
  },
  {
    id: "w2",
    name: "Kim & Park",
    partySize: 2,
    quotedWait: 15,
    elapsedWait: 12,
    barTab: 34,
  },
  {
    id: "w3",
    name: "Thompson party",
    partySize: 6,
    quotedWait: 40,
    elapsedWait: 5,
    notes: "No tables predicted for 35 min",
  },
  {
    id: "w4",
    name: "Ali, Yusuf",
    partySize: 2,
    quotedWait: 20,
    elapsedWait: 3,
    autoMatch: "T3",
    autoMatchTime: 0,
    notes: "Auto-match: T3 turning now",
  },
  {
    id: "w5",
    name: "O'Brien group",
    partySize: 5,
    quotedWait: 45,
    elapsedWait: 1,
    notes: "Needs large table - T8+T9 booked until 9:15",
  },
]

// ── Mock Occupied Tables (8 tables for Turn Tracker) ─────────────────────────

export const occupiedTables: OccupiedTable[] = [
  { id: "ot1", tableNumber: "T3", partySize: 2, courseStage: "check-printed", predictedTurnMin: 5, mealProgressPct: 92, seatedAt: "18:15" },
  { id: "ot2", tableNumber: "T7", partySize: 4, courseStage: "paying", predictedTurnMin: 3, mealProgressPct: 96, seatedAt: "18:00" },
  { id: "ot3", tableNumber: "T14", partySize: 4, courseStage: "mains-served", predictedTurnMin: 12, mealProgressPct: 70, noDessertOrdered: true, seatedAt: "18:45" },
  { id: "ot4", tableNumber: "T22", partySize: 2, courseStage: "check-requested", predictedTurnMin: 4, mealProgressPct: 94, seatedAt: "18:30" },
  { id: "ot5", tableNumber: "T1", partySize: 6, courseStage: "appetizers", predictedTurnMin: 65, mealProgressPct: 15, seatedAt: "19:10" },
  { id: "ot6", tableNumber: "T18", partySize: 2, courseStage: "ordering", predictedTurnMin: 55, mealProgressPct: 8, seatedAt: "19:18" },
  { id: "ot7", tableNumber: "T20", partySize: 4, courseStage: "mains-served", predictedTurnMin: 30, mealProgressPct: 55, seatedAt: "18:50" },
  { id: "ot8", tableNumber: "T9", partySize: 4, courseStage: "dessert", predictedTurnMin: 15, mealProgressPct: 82, seatedAt: "18:20" },
]

// ── Capacity Slots (30-min intervals) ────────────────────────────────────────

export const capacitySlots: CapacitySlot[] = [
  { time: "17:00", occupancyPct: 12, seatsOccupied: 9, totalSeats: 78, arrivingReservations: 2, predictedTurns: 0 },
  { time: "17:30", occupancyPct: 18, seatsOccupied: 14, totalSeats: 78, arrivingReservations: 3, predictedTurns: 0 },
  { time: "18:00", occupancyPct: 45, seatsOccupied: 35, totalSeats: 78, arrivingReservations: 5, predictedTurns: 1 },
  { time: "18:30", occupancyPct: 72, seatsOccupied: 56, totalSeats: 78, arrivingReservations: 4, predictedTurns: 2 },
  { time: "19:00", occupancyPct: 88, seatsOccupied: 69, totalSeats: 78, arrivingReservations: 6, predictedTurns: 2 },
  { time: "19:30", occupancyPct: 95, seatsOccupied: 74, totalSeats: 78, arrivingReservations: 4, predictedTurns: 1 },
  { time: "20:00", occupancyPct: 100, seatsOccupied: 78, totalSeats: 78, arrivingReservations: 5, predictedTurns: 3 },
  { time: "20:30", occupancyPct: 92, seatsOccupied: 72, totalSeats: 78, arrivingReservations: 2, predictedTurns: 4 },
  { time: "21:00", occupancyPct: 75, seatsOccupied: 58, totalSeats: 78, arrivingReservations: 2, predictedTurns: 5 },
  { time: "21:30", occupancyPct: 52, seatsOccupied: 41, totalSeats: 78, arrivingReservations: 1, predictedTurns: 4 },
  { time: "22:00", occupancyPct: 30, seatsOccupied: 23, totalSeats: 78, arrivingReservations: 0, predictedTurns: 3 },
  { time: "22:30", occupancyPct: 12, seatsOccupied: 9, totalSeats: 78, arrivingReservations: 0, predictedTurns: 2 },
]

// ── Tonight's Pace Metrics ───────────────────────────────────────────────────

export const paceMetrics: PaceMetrics = {
  revenue: 4280,
  revenueTarget: 6500,
  covers: 94,
  coversExpected: 156,
  avgTurnMin: 72,
  avgTurnTarget: 68,
  kitchenTickets: 12,
  kitchenLoad: "moderate",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getUpcomingReservations(
  allReservations: Reservation[],
  currentTime: string
): Reservation[] {
  const [currentH, currentM] = currentTime.split(":").map(Number)
  const currentMinutes = currentH * 60 + currentM
  const windowEnd = currentMinutes + 120 // next 2 hours

  return allReservations.filter((r) => {
    if (r.status === "completed" || r.status === "cancelled" || r.status === "no-show" || r.status === "seated") return false
    const [h, m] = r.time.split(":").map(Number)
    const resMinutes = h * 60 + m
    return resMinutes >= currentMinutes - 15 && resMinutes <= windowEnd
  })
}

export function groupReservationsByTime(
  upcomingReservations: Reservation[],
  currentTime: string
): { label: string; time: string; isArrivingNow: boolean; reservations: Reservation[] }[] {
  const [currentH, currentM] = currentTime.split(":").map(Number)
  const currentMinutes = currentH * 60 + currentM

  const grouped = new Map<string, Reservation[]>()
  for (const r of upcomingReservations) {
    const existing = grouped.get(r.time) || []
    existing.push(r)
    grouped.set(r.time, existing)
  }

  const result: { label: string; time: string; isArrivingNow: boolean; reservations: Reservation[] }[] = []
  for (const [time, resos] of grouped) {
    const [h, m] = time.split(":").map(Number)
    const resMinutes = h * 60 + m
    const diff = resMinutes - currentMinutes

    let isArrivingNow = false
    let label: string

    if (diff <= 0 && diff >= -15) {
      isArrivingNow = true
      label = "Arriving Now"
    } else {
      const hour = h > 12 ? h - 12 : h
      const ampm = h >= 12 ? "PM" : "AM"
      const minuteStr = m.toString().padStart(2, "0")
      label = `${hour}:${minuteStr} ${ampm}`
      if (resos.length > 1) label += ` (${resos.length} reservations)`
    }

    result.push({ label, time, isArrivingNow, reservations: resos })
  }

  return result.sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number)
    const [bh, bm] = b.time.split(":").map(Number)
    return ah * 60 + am - (bh * 60 + bm)
  })
}

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

export function getHeroStats(allReservations: Reservation[]) {
  const totalCapacity = restaurantConfig.totalSeats
  const tonightReservations = allReservations.filter(
    (r) => r.status !== "cancelled"
  )
  const nowMinutes = (() => {
    const [h, m] = restaurantConfig.currentTime.split(":").map(Number)
    return h * 60 + m
  })()
  const currentSlot =
    capacitySlots.find((slot) => {
      const [h, m] = slot.time.split(":").map(Number)
      const slotStart = h * 60 + m
      return slotStart <= nowMinutes && nowMinutes < slotStart + 30
    }) ?? capacitySlots[0]

  const totalCovers = tonightReservations.reduce((sum, r) => sum + r.partySize, 0)
  const reserved = tonightReservations.filter(
    (r) => r.status === "confirmed" || r.status === "late"
  ).length
  const seated = allReservations
    .filter((r) => r.status === "seated")
    .reduce((sum, r) => sum + r.partySize, 0)
  const walkIns = 8
  const waitlist = waitlistParties.length
  const noShows = allReservations.filter((r) => r.status === "no-show").length
  const noShowPct = tonightReservations.length > 0
    ? ((noShows / tonightReservations.length) * 100).toFixed(1)
    : "0"
  const upcoming2h = getUpcomingReservations(allReservations, restaurantConfig.currentTime).length

  return {
    covers: { current: totalCovers, capacity: totalCapacity },
    reserved,
    seated,
    walkIns,
    waitlist,
    noShows,
    noShowPct,
    capacityNow: {
      pct: currentSlot.occupancyPct,
      occupied: currentSlot.seatsOccupied,
      total: currentSlot.totalSeats,
    },
    upcoming2h,
  }
}

export function getCourseLabel(stage: CourseStage): string {
  const labels: Record<CourseStage, string> = {
    ordering: "Ordering",
    appetizers: "Appetizers firing",
    "mains-fired": "Mains fired",
    "mains-served": "Mains served",
    dessert: "Dessert served",
    "check-requested": "Check requested",
    "check-printed": "Check printed",
    paying: "Paying now",
  }
  return labels[stage]
}

export function getWaitTimerStatus(
  elapsed: number,
  quoted: number
): "normal" | "warning" | "overdue" {
  const ratio = elapsed / quoted
  if (ratio >= 1) return "overdue"
  if (ratio >= 0.8) return "warning"
  return "normal"
}
