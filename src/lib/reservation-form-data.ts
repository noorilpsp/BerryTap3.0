import { getTimelineBlocksNoOverlap } from "./timeline-data"
import { restaurantConfig } from "./reservations-data"

// ── Reservation Create/Edit Form Data ────────────────────────────────────────

export interface GuestProfile {
  id: string
  name: string
  phone: string
  email: string
  visitCount: number
  lastVisit: string | null
  avgSpend: number
  allergies: string[]
  preferences: string[]
  tags: string[]
  noShowCount: number
  totalReservations: number
}

export interface AvailableTable {
  id: string
  label: string
  seats: number
  zone: string
  zoneLabel: string
  server: string
  features: string[]
  availableFrom: string
  availableUntil: string
  matchScore: number
  matchReasons: string[]
  avoidReasons?: string[]
}

export interface BusyTable {
  id: string
  label: string
  guest: string
  time: string
  partySize: number
  reason: string
}

export interface CapacitySnapshot {
  time: string
  label: string
  occupancyPct: number
  seatsOccupied: number
  totalSeats: number
}

export interface TimeSlotStatus {
  time: string
  label: string
  status: "available" | "busy" | "full" | "closed"
}

export interface ConflictWarning {
  id: string
  type: "buffer" | "risk" | "info" | "merge"
  severity: "warning" | "info"
  message: string
  suggestion?: string
}

export type FormTag =
  | "vip"
  | "birthday"
  | "anniversary"
  | "allergy"
  | "highchair"
  | "accessible"
  | "service-dog"
  | "business"
  | "celebration"
  | "high-value"
  | "first-timer"

export interface FormTagDef {
  id: FormTag
  label: string
  icon: string
  triggersField?: "allergy-detail" | "date-detail" | "quantity" | "accessible-filter"
}

export type TableAssignMode = "auto" | "manual" | "unassigned"

export type BookingChannel = "direct" | "phone" | "website" | "google" | "opentable" | "instagram" | "app" | "concierge"

export interface ReservationFormData {
  guestName: string
  guestId: string | null
  phone: string
  email: string
  date: string
  time: string
  partySize: number
  duration: number
  tableAssignMode: TableAssignMode
  assignedTable: string | null
  zonePreference: string
  tags: FormTag[]
  allergyDetail: string
  notes: string
  sendSms: boolean
  sendEmail: boolean
  requireDeposit: boolean
  depositAmount: string
  addToCalendar: boolean
  channel: BookingChannel
}

export interface EditModeData {
  reservationId: string
  createdAt: string
  createdVia: string
  lastModified: string | null
  lastModifiedNote: string | null
  originalTime: string | null
}

// ── Tag Definitions ──────────────────────────────────────────────────────────

export const formTagDefs: FormTagDef[] = [
  { id: "vip", label: "VIP", icon: "Star" },
  { id: "birthday", label: "Birthday", icon: "Cake", triggersField: "date-detail" },
  { id: "anniversary", label: "Anniversary", icon: "Heart", triggersField: "date-detail" },
  { id: "allergy", label: "Allergy", icon: "ShieldAlert", triggersField: "allergy-detail" },
  { id: "highchair", label: "Highchair", icon: "Baby", triggersField: "quantity" },
  { id: "accessible", label: "Accessible", icon: "Accessibility", triggersField: "accessible-filter" },
  { id: "service-dog", label: "Service Dog", icon: "Dog" },
  { id: "business", label: "Business", icon: "Briefcase" },
  { id: "celebration", label: "Celebration", icon: "PartyPopper" },
  { id: "high-value", label: "High-value", icon: "Crown" },
  { id: "first-timer", label: "First-timer", icon: "Sparkles" },
]

export const bookingChannels: { value: BookingChannel; label: string }[] = [
  { value: "direct", label: "Direct / Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "google", label: "Google" },
  { value: "opentable", label: "OpenTable" },
  { value: "instagram", label: "Instagram" },
  { value: "app", label: "App" },
  { value: "concierge", label: "Concierge" },
]

// ── Guest Database (10 profiles) ─────────────────────────────────────────────

export const guestDatabase: GuestProfile[] = [
  {
    id: "g1",
    name: "Sarah Chen",
    phone: "+1 (555) 234-5678",
    email: "sarah@email.com",
    visitCount: 12,
    lastVisit: "Jan 3, 2025",
    avgSpend: 220,
    allergies: ["Shellfish"],
    preferences: ["Window seat", "Old Fashioned cocktail"],
    tags: ["vip", "high-value"],
    noShowCount: 0,
    totalReservations: 12,
  },
  {
    id: "g2",
    name: "Marcus Webb",
    phone: "+1 (555) 876-5432",
    email: "marcus.w@email.com",
    visitCount: 1,
    lastVisit: "Dec 28, 2024",
    avgSpend: 85,
    allergies: [],
    preferences: [],
    tags: ["first-timer"],
    noShowCount: 0,
    totalReservations: 1,
  },
  {
    id: "g3",
    name: "Nguyen Family",
    phone: "+1 (555) 345-6789",
    email: "nguyen.fam@email.com",
    visitCount: 8,
    lastVisit: "Jan 10, 2025",
    avgSpend: 180,
    allergies: ["Nut allergy"],
    preferences: ["Quiet area", "Birthday celebrations"],
    tags: ["birthday"],
    noShowCount: 0,
    totalReservations: 8,
  },
  {
    id: "g4",
    name: "Jake Morrison",
    phone: "+1 (555) 987-6543",
    email: "jake.m@email.com",
    visitCount: 3,
    lastVisit: "Dec 15, 2024",
    avgSpend: 65,
    allergies: [],
    preferences: [],
    tags: [],
    noShowCount: 2,
    totalReservations: 5,
  },
  {
    id: "g5",
    name: "Claire Dubois",
    phone: "+1 (555) 456-7890",
    email: "claire.d@email.com",
    visitCount: 5,
    lastVisit: "Jan 8, 2025",
    avgSpend: 95,
    allergies: [],
    preferences: ["Lunch regular"],
    tags: [],
    noShowCount: 0,
    totalReservations: 5,
  },
  {
    id: "g6",
    name: "Kim Family",
    phone: "+1 (555) 567-8901",
    email: "kim.family@email.com",
    visitCount: 15,
    lastVisit: "Jan 14, 2025",
    avgSpend: 165,
    allergies: [],
    preferences: ["Corner booth"],
    tags: ["vip", "high-value"],
    noShowCount: 0,
    totalReservations: 15,
  },
  {
    id: "g7",
    name: "Yusuf Ali",
    phone: "+1 (555) 678-9012",
    email: "yusuf.ali@email.com",
    visitCount: 2,
    lastVisit: "Jan 5, 2025",
    avgSpend: 75,
    allergies: [],
    preferences: [],
    tags: [],
    noShowCount: 0,
    totalReservations: 2,
  },
  {
    id: "g8",
    name: "James Anderson",
    phone: "+1 (555) 789-0123",
    email: "j.anderson@email.com",
    visitCount: 6,
    lastVisit: "Jan 11, 2025",
    avgSpend: 310,
    allergies: [],
    preferences: ["Celebrates frequently", "Prefers champagne"],
    tags: ["high-value", "celebration"],
    noShowCount: 0,
    totalReservations: 6,
  },
  {
    id: "g9",
    name: "Sofia Rivera",
    phone: "+1 (555) 890-1234",
    email: "sofia.r@email.com",
    visitCount: 4,
    lastVisit: "Jan 2, 2025",
    avgSpend: 190,
    allergies: [],
    preferences: ["Anniversary couple", "Romantic setting"],
    tags: ["anniversary"],
    noShowCount: 0,
    totalReservations: 4,
  },
  {
    id: "g10",
    name: "Raj Patel",
    phone: "+1 (555) 901-2345",
    email: "raj.p@email.com",
    visitCount: 7,
    lastVisit: "Jan 13, 2025",
    avgSpend: 145,
    allergies: [],
    preferences: ["Vegetarian preference"],
    tags: [],
    noShowCount: 0,
    totalReservations: 7,
  },
]

// ── Available Tables for 7:30 PM ─────────────────────────────────────────────

export const availableTables: AvailableTable[] = [
  {
    id: "T12",
    label: "T12",
    seats: 4,
    zone: "main",
    zoneLabel: "Main Dining",
    server: "Mike",
    features: ["Window"],
    availableFrom: "7:25 PM",
    availableUntil: "Close",
    matchScore: 98,
    matchReasons: [
      "Matches party size (4-top)",
      "Guest's preferred spot (window)",
      "Available 7:30 - 9:30+",
      "Server Mike (familiar with guest)",
    ],
  },
  {
    id: "T7",
    label: "T7",
    seats: 4,
    zone: "main",
    zoneLabel: "Main Dining",
    server: "Anna",
    features: [],
    availableFrom: "7:30 PM",
    availableUntil: "9:15 PM",
    matchScore: 82,
    matchReasons: [
      "Matches party size (4-top)",
      "Available at requested time",
    ],
  },
  {
    id: "T14",
    label: "T14",
    seats: 4,
    zone: "main",
    zoneLabel: "Main Dining",
    server: "Lisa",
    features: [],
    availableFrom: "5:00 PM",
    availableUntil: "Close",
    matchScore: 78,
    matchReasons: [
      "Matches party size (4-top)",
      "Open all evening",
    ],
  },
  {
    id: "T20",
    label: "T20",
    seats: 4,
    zone: "patio",
    zoneLabel: "Patio",
    server: "Carlos",
    features: ["Outdoor"],
    availableFrom: "7:30 PM",
    availableUntil: "Close",
    matchScore: 65,
    matchReasons: [
      "Matches party size (4-top)",
      "Outdoor seating",
    ],
  },
  {
    id: "T25",
    label: "T25",
    seats: 4,
    zone: "private",
    zoneLabel: "Private Room",
    server: "Jordan",
    features: ["Private"],
    availableFrom: "7:30 PM",
    availableUntil: "9:00 PM",
    matchScore: 55,
    matchReasons: [
      "Matches party size (4-top)",
      "Private dining option",
    ],
  },
]

// ── Busy Tables ──────────────────────────────────────────────────────────────

export const busyTables: BusyTable[] = [
  { id: "T8", label: "T8+T9", guest: "O'Brien", time: "7:00 PM", partySize: 6, reason: "Birthday party (6p)" },
  { id: "T22", label: "T22", guest: "Williams", time: "6:30 PM", partySize: 2, reason: "Booked until 8:30" },
  { id: "T1", label: "T1", guest: "Williams", time: "6:00 PM", partySize: 2, reason: "Dessert stage" },
  { id: "T3", label: "T3", guest: "Jensen", time: "6:15 PM", partySize: 4, reason: "Finishing up" },
  { id: "T16", label: "T16", guest: "Nguyen", time: "7:00 PM", partySize: 6, reason: "Mains served" },
]

// ── Capacity Timeline ────────────────────────────────────────────────────────

export const capacityTimeline: CapacitySnapshot[] = [
  { time: "17:00", label: "5:00 PM", occupancyPct: 12, seatsOccupied: 9, totalSeats: 78 },
  { time: "17:30", label: "5:30 PM", occupancyPct: 18, seatsOccupied: 14, totalSeats: 78 },
  { time: "18:00", label: "6:00 PM", occupancyPct: 45, seatsOccupied: 35, totalSeats: 78 },
  { time: "18:30", label: "6:30 PM", occupancyPct: 72, seatsOccupied: 56, totalSeats: 78 },
  { time: "19:00", label: "7:00 PM", occupancyPct: 88, seatsOccupied: 69, totalSeats: 78 },
  { time: "19:30", label: "7:30 PM", occupancyPct: 80, seatsOccupied: 62, totalSeats: 78 },
  { time: "20:00", label: "8:00 PM", occupancyPct: 100, seatsOccupied: 78, totalSeats: 78 },
  { time: "20:30", label: "8:30 PM", occupancyPct: 92, seatsOccupied: 72, totalSeats: 78 },
  { time: "21:00", label: "9:00 PM", occupancyPct: 75, seatsOccupied: 58, totalSeats: 78 },
  { time: "21:30", label: "9:30 PM", occupancyPct: 52, seatsOccupied: 41, totalSeats: 78 },
  { time: "22:00", label: "10:00 PM", occupancyPct: 30, seatsOccupied: 23, totalSeats: 78 },
]

// ── Time Slot Statuses ───────────────────────────────────────────────────────

export const timeSlots: TimeSlotStatus[] = [
  { time: "17:00", label: "5:00 PM", status: "available" },
  { time: "17:15", label: "5:15 PM", status: "available" },
  { time: "17:30", label: "5:30 PM", status: "available" },
  { time: "17:45", label: "5:45 PM", status: "available" },
  { time: "18:00", label: "6:00 PM", status: "available" },
  { time: "18:15", label: "6:15 PM", status: "available" },
  { time: "18:30", label: "6:30 PM", status: "busy" },
  { time: "18:45", label: "6:45 PM", status: "busy" },
  { time: "19:00", label: "7:00 PM", status: "busy" },
  { time: "19:15", label: "7:15 PM", status: "busy" },
  { time: "19:30", label: "7:30 PM", status: "busy" },
  { time: "19:45", label: "7:45 PM", status: "busy" },
  { time: "20:00", label: "8:00 PM", status: "full" },
  { time: "20:15", label: "8:15 PM", status: "full" },
  { time: "20:30", label: "8:30 PM", status: "busy" },
  { time: "20:45", label: "8:45 PM", status: "busy" },
  { time: "21:00", label: "9:00 PM", status: "available" },
  { time: "21:15", label: "9:15 PM", status: "available" },
  { time: "21:30", label: "9:30 PM", status: "available" },
  { time: "21:45", label: "9:45 PM", status: "available" },
  { time: "22:00", label: "10:00 PM", status: "available" },
  { time: "22:15", label: "10:15 PM", status: "closed" },
  { time: "22:30", label: "10:30 PM", status: "closed" },
]

// ── Mini Timeline Data ───────────────────────────────────────────────────────

export interface MiniTimelineEntry {
  tableLabel: string
  blocks: { guest: string; startMin: number; endMin: number; isNew?: boolean }[]
}

export const miniTimeline: MiniTimelineEntry[] = [
  {
    tableLabel: "T12",
    blocks: [
      { guest: "Patel", startMin: 0, endMin: 55 },
      { guest: "Chen", startMin: 60, endMin: 150, isNew: true },
    ],
  },
  {
    tableLabel: "T7",
    blocks: [
      { guest: "Kim", startMin: 0, endMin: 50 },
      { guest: "Garcia", startMin: 70, endMin: 150 },
    ],
  },
  {
    tableLabel: "T14",
    blocks: [
      { guest: "Morrison?", startMin: 50, endMin: 140 },
    ],
  },
]
// timeline starts at 7:00 PM (420 min), each entry relative from 0
export const MINI_TL_START = 420 // 7:00 PM in minutes
export const MINI_TL_END = 570 // 9:30 PM in minutes
export const MINI_TL_RANGE = MINI_TL_END - MINI_TL_START // 150 min
export const MINI_TL_NOW_OFFSET = 30 // 7:30 PM = 30 min from start

// ── Helpers ──────────────────────────────────────────────────────────────────

export function searchGuests(query: string): GuestProfile[] {
  if (!query || query.length < 2) return []
  const lower = query.toLowerCase()
  return guestDatabase.filter(
    (g) =>
      g.name.toLowerCase().includes(lower) ||
      g.phone.includes(query) ||
      g.email.toLowerCase().includes(lower)
  )
}

export function getDurationForParty(size: number): number {
  if (size <= 2) return 75
  if (size <= 4) return 90
  if (size <= 6) return 105
  return 120
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function getConflictsForSelection(
  time: string,
  tableId: string | null,
  partySize: number,
  guest: GuestProfile | null
): ConflictWarning[] {
  const warnings: ConflictWarning[] = []

  if (tableId === "T12" && time === "19:30") {
    warnings.push({
      id: "c1",
      type: "buffer",
      severity: "warning",
      message: "T12 has a reservation ending at 7:25. There's only a 5-minute buffer.",
      suggestion: "Consider 7:45 PM or a different table.",
    })
  }

  if (guest && guest.noShowCount >= 2) {
    const noShowRate = Math.round((guest.noShowCount / guest.totalReservations) * 100)
    warnings.push({
      id: "c2",
      type: "risk",
      severity: "warning",
      message: `This guest has ${guest.noShowCount} no-shows out of ${guest.totalReservations} reservations (${noShowRate}% no-show rate). Consider requiring a deposit.`,
    })
  }

  if (guest && !guest.visitCount) {
    const dayOfWeek = "Friday"
    if (dayOfWeek === "Friday" && partySize >= 6) {
      warnings.push({
        id: "c3",
        type: "risk",
        severity: "warning",
        message: `First-time guest booking for a Friday ${time} ${partySize}-top. Historical no-show risk: 23%. Consider requiring deposit.`,
      })
    }
  }

  if (guest && guest.id === "g1" && guest.visitCount >= 10) {
    warnings.push({
      id: "c4",
      type: "info",
      severity: "info",
      message: `${guest.name} last visited ${guest.lastVisit} and usually stays 2+ hours. Adjust duration?`,
    })
  }

  if (partySize >= 7) {
    warnings.push({
      id: "c5",
      type: "merge",
      severity: "info",
      message: `Party of ${partySize} requires merging tables. Options: T8+T9, T15+T16, T23+T24`,
    })
  }

  return warnings
}

export function getRiskLevel(guest: GuestProfile | null): { level: "low" | "medium" | "high"; label: string; color: string } {
  if (!guest) return { level: "medium", label: "Unknown", color: "text-amber-400" }
  if (guest.noShowCount >= 2) return { level: "high", label: "High", color: "text-red-400" }
  if (guest.visitCount <= 1) return { level: "medium", label: "Medium", color: "text-amber-400" }
  return { level: "low", label: "Low", color: "text-emerald-400" }
}

export function getCapacityAtTime(time: string): CapacitySnapshot | undefined {
  const parseMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
  }
  const toLabel = (hhmm: string): string => {
    const [h, m] = hhmm.split(":").map(Number)
    const hour12 = h % 12 === 0 ? 12 : h % 12
    const suffix = h >= 12 ? "PM" : "AM"
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`
  }

  const target = parseMinutes(time)
  const totalSeats = restaurantConfig.totalSeats
  if (totalSeats <= 0) return undefined

  const activeSeatDemand = getTimelineBlocksNoOverlap()
    .filter((block) => block.status !== "no-show")
    .filter((block) => {
      const start = parseMinutes(block.startTime)
      let end = parseMinutes(block.endTime)
      if (end <= start) end += 24 * 60

      let point = target
      if (point < start) point += 24 * 60
      return point >= start && point < end
    })
    .reduce((sum, block) => sum + block.partySize, 0)

  const seatsOccupied = Math.min(totalSeats, Math.max(0, activeSeatDemand))
  const occupancyPct = Math.round((seatsOccupied / totalSeats) * 100)

  return {
    time,
    label: toLabel(time),
    occupancyPct,
    seatsOccupied,
    totalSeats,
  }
}

export function getFilteredTables(
  zonePreference: string,
  partySize: number
): AvailableTable[] {
  return availableTables
    .filter((t) => {
      if (zonePreference && zonePreference !== "any" && t.zone !== zonePreference) return false
      if (t.seats < partySize) return false
      return true
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

// ── Edit mode sample data ────────────────────────────────────────────────────

export const sampleEditData: EditModeData = {
  reservationId: "r9",
  createdAt: "Jan 15, 2025 at 2:34 PM",
  createdVia: "Direct",
  lastModified: "Jan 16, 2025 at 10:15 AM",
  lastModifiedNote: "Time changed from 7:00 to 7:30",
  originalTime: "19:00",
}

export const defaultFormData: ReservationFormData = {
  guestName: "",
  guestId: null,
  phone: "",
  email: "",
  date: "2025-01-17",
  time: "19:30",
  partySize: 4,
  duration: 90,
  tableAssignMode: "auto",
  assignedTable: null,
  zonePreference: "any",
  tags: [],
  allergyDetail: "",
  notes: "",
  sendSms: true,
  sendEmail: true,
  requireDeposit: false,
  depositAmount: "",
  addToCalendar: false,
  channel: "direct",
}

export const editFormData: ReservationFormData = {
  guestName: "Sarah Chen",
  guestId: "g1",
  phone: "+1 (555) 234-5678",
  email: "sarah@email.com",
  date: "2025-01-17",
  time: "19:30",
  partySize: 4,
  duration: 90,
  tableAssignMode: "auto",
  assignedTable: "T12",
  zonePreference: "any",
  tags: ["vip", "allergy"],
  allergyDetail: "Shellfish",
  notes: "Window seat preferred. 12th visit, prefers Old Fashioned cocktail.",
  sendSms: true,
  sendEmail: true,
  requireDeposit: false,
  depositAmount: "",
  addToCalendar: false,
  channel: "direct",
}
