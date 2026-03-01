export type ZoneId = "all" | "main" | "patio" | "private"
export type HeatMapMode =
  | "off"
  | "availability"
  | "server-load"
  | "revenue"
  | "turn-time"

export type FloorTableStatus =
  | "empty"
  | "reserved"
  | "seated"
  | "arriving-soon"
  | "high-risk"
  | "completed"
  | "merged"

export type CourseState =
  | "welcome"
  | "apps"
  | "mains"
  | "dessert"
  | "paying"
  | "check-printed"
  | "check-requested"

export type FloorTable = {
  id: string
  label: string
  seats: number
  zone: Exclude<ZoneId, "all">
  areaLabel?: string
  x: number
  y: number
  width: number
  height: number
  shape: "round" | "square" | "rectangle"
  mergedWith?: string
}

export type GuestTag = {
  type: string
  label: string
}

export type ReservationPreview = {
  id: string
  guestName: string
  partySize: number
  time: string
  tags: GuestTag[]
  visitCount?: number
}

export type TableHistoryItem = {
  time: string
  guest: string
  partySize: number
  check: number
}

export type FloorTableState = {
  table: FloorTable
  status: FloorTableStatus
  currentGuest?: string
  currentPartySize?: number
  currentCourse?: CourseState
  seatedAt?: string
  estClearTime?: string
  nextReservation?: ReservationPreview
  afterNext?: string
  todayHistory: TableHistoryItem[]
  turnsToday: number
  avgTurnTime: number
}

export type ServerInfo = {
  id: string
  name: string
  color: "purple" | "teal" | "amber" | "cyan" | "pink"
  colorHex: string
  load: "low" | "medium" | "high"
}

export type ServerSection = {
  id: string
  name: string
  colorHex: string
  tables: string[]
  activeTables: number
}

export type RevenueInfo = {
  currentCheck: number
}

export type TurnTimeInfo = {
  seatedDurationMin: number
  status: "fast" | "on-target" | "slow"
}

export type UnassignedReservation = {
  id: string
  guestName: string
  partySize: number
  time: string
  risk: "low" | "medium" | "high"
  riskScore: number
  needsTableType: string
}

export const DINNER_START_MIN = 17 * 60
export const DINNER_END_MIN = 22 * 60
const now = new Date()
const nowMinRaw = now.getHours() * 60 + now.getMinutes()
export const NOW_MIN = Math.max(DINNER_START_MIN, Math.min(DINNER_END_MIN, nowMinRaw))

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export function formatTime12h(time: string): string {
  const [rawH = "0", rawM = "0"] = time.split(":")
  const h = Number(rawH)
  const m = Number(rawM)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`
}

export function minutesToTime12h(minutes: number): string {
  return formatTime12h(minutesToTime(minutes))
}

export const restaurantConfig = {
  currentDate: new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now),
  currentTime: minutesToTime(NOW_MIN),
  servicePeriods: [
    { id: "dinner-early", label: "Early Dinner", start: "17:00", end: "19:00" },
    { id: "dinner-peak", label: "Peak Dinner", start: "19:00", end: "21:00" },
    { id: "late", label: "Late Seating", start: "21:00", end: "22:30" },
  ],
}

export const floorTables: FloorTable[] = [
  { id: "t1", label: "T1", seats: 2, zone: "main", x: 10, y: 18, width: 8, height: 8, shape: "round" },
  { id: "t2", label: "T2", seats: 2, zone: "main", x: 23, y: 18, width: 8, height: 8, shape: "round" },
  { id: "t3", label: "T3", seats: 4, zone: "main", x: 36, y: 18, width: 10, height: 8, shape: "rectangle" },
  { id: "t4", label: "T4", seats: 4, zone: "main", x: 52, y: 18, width: 10, height: 8, shape: "rectangle" },
  { id: "t5", label: "T5", seats: 6, zone: "patio", x: 15, y: 90, width: 11, height: 8, shape: "rectangle" },
  { id: "t6", label: "T6", seats: 4, zone: "patio", x: 33, y: 90, width: 10, height: 8, shape: "square" },
  { id: "t7", label: "T7", seats: 8, zone: "private", x: 80, y: 22, width: 12, height: 10, shape: "rectangle" },
  { id: "t8", label: "T8", seats: 6, zone: "private", x: 80, y: 40, width: 12, height: 10, shape: "rectangle" },
  { id: "t9", label: "T9", seats: 4, zone: "main", x: 52, y: 38, width: 10, height: 8, shape: "square", mergedWith: "t10" },
  { id: "t10", label: "T10", seats: 4, zone: "main", x: 64, y: 38, width: 10, height: 8, shape: "square", mergedWith: "t9" },
]

const SERVER_MAP: Record<string, ServerInfo> = {
  t1: { id: "s1", name: "Sarah", color: "purple", colorHex: "#a855f7", load: "medium" },
  t2: { id: "s1", name: "Sarah", color: "purple", colorHex: "#a855f7", load: "medium" },
  t3: { id: "s2", name: "Marco", color: "teal", colorHex: "#14b8a6", load: "high" },
  t4: { id: "s2", name: "Marco", color: "teal", colorHex: "#14b8a6", load: "high" },
  t5: { id: "s3", name: "Ava", color: "amber", colorHex: "#f59e0b", load: "low" },
  t6: { id: "s3", name: "Ava", color: "amber", colorHex: "#f59e0b", load: "low" },
  t7: { id: "s4", name: "Noah", color: "cyan", colorHex: "#06b6d4", load: "medium" },
  t8: { id: "s4", name: "Noah", color: "cyan", colorHex: "#06b6d4", load: "medium" },
  t9: { id: "s5", name: "Lina", color: "pink", colorHex: "#ec4899", load: "medium" },
  t10: { id: "s5", name: "Lina", color: "pink", colorHex: "#ec4899", load: "medium" },
}

export const serverSections: ServerSection[] = [
  { id: "sec-main-a", name: "Main A", colorHex: "#a855f7", tables: ["t1", "t2"], activeTables: 1 },
  { id: "sec-main-b", name: "Main B", colorHex: "#14b8a6", tables: ["t3", "t4", "t9", "t10"], activeTables: 3 },
  { id: "sec-patio", name: "Patio", colorHex: "#f59e0b", tables: ["t5", "t6"], activeTables: 1 },
  { id: "sec-private", name: "Private", colorHex: "#06b6d4", tables: ["t7", "t8"], activeTables: 2 },
]

export const unassignedReservations: UnassignedReservation[] = [
  {
    id: "u1",
    guestName: "Carter",
    partySize: 4,
    time: "18:30",
    risk: "medium",
    riskScore: 54,
    needsTableType: "Window preferred",
  },
  {
    id: "u2",
    guestName: "Nguyen",
    partySize: 2,
    time: "19:15",
    risk: "high",
    riskScore: 81,
    needsTableType: "Quiet corner",
  },
]

function statusForTable(index: number, minute: number): FloorTableStatus {
  if (index >= 8) return "merged"
  const cycle = (minute + index * 13) % 7
  if (cycle <= 1) return "empty"
  if (cycle === 2) return "reserved"
  if (cycle === 3) return "arriving-soon"
  if (cycle === 4) return "seated"
  if (cycle === 5) return "high-risk"
  return "completed"
}

function makeReservation(id: string, minute: number, partySize: number): ReservationPreview {
  return {
    id,
    guestName: `Guest ${id.toUpperCase()}`,
    partySize,
    time: minutesToTime(minute),
    tags: [{ type: "vip", label: "VIP" }],
    visitCount: 3,
  }
}

export function getFloorTableStates(scrubTime: string): FloorTableState[] {
  const [h = "0", m = "0"] = scrubTime.split(":")
  const minute = Number(h) * 60 + Number(m)

  return floorTables.map((table, i) => {
    const status = statusForTable(i, minute)
    const seatedAt = minutesToTime(Math.max(DINNER_START_MIN, minute - (20 + i * 3)))
    const estClearTime = minutesToTime(Math.min(DINNER_END_MIN + 30, minute + (35 + i * 2)))

    const hasCurrent = status === "seated" || status === "arriving-soon" || status === "high-risk"
    const hasNext = status === "reserved" || status === "completed" || status === "empty"

    return {
      table,
      status,
      currentGuest: hasCurrent ? `Party ${i + 1}` : undefined,
      currentPartySize: hasCurrent ? Math.min(table.seats, (i % table.seats) + 2) : undefined,
      currentCourse: hasCurrent ? (i % 3 === 0 ? "mains" : i % 3 === 1 ? "dessert" : "paying") : undefined,
      seatedAt: hasCurrent ? seatedAt : undefined,
      estClearTime: hasCurrent ? estClearTime : undefined,
      nextReservation: hasNext ? makeReservation(table.id, Math.min(DINNER_END_MIN, minute + 25 + i * 4), Math.min(table.seats, 2 + (i % 3))) : undefined,
      afterNext: hasNext ? `Next reservation around ${minutesToTime12h(Math.min(DINNER_END_MIN, minute + 70))}` : "No upcoming reservations",
      todayHistory: [
        { time: "17:20", guest: "Lee", partySize: 2, check: 48 },
        { time: "18:05", guest: "Garcia", partySize: 4, check: 109 },
      ],
      turnsToday: 2 + (i % 3),
      avgTurnTime: 68 + i,
    }
  })
}

export function getServerForTable(tableId: string): ServerInfo | undefined {
  return SERVER_MAP[tableId]
}

export function getRevenueForTable(tableId: string): RevenueInfo | undefined {
  const n = Number(tableId.replace(/\D/g, "")) || 1
  return { currentCheck: n * 12 + 24 }
}

export function getTurnTimeForTable(tableId: string): TurnTimeInfo {
  const n = Number(tableId.replace(/\D/g, "")) || 1
  const seatedDurationMin = 20 + n * 7
  if (seatedDurationMin < 45) return { seatedDurationMin, status: "fast" }
  if (seatedDurationMin < 80) return { seatedDurationMin, status: "on-target" }
  return { seatedDurationMin, status: "slow" }
}

export function getAvailabilityColor(status: FloorTableStatus): {
  border: string
  bg: string
  glow: string
} {
  if (status === "empty") return { border: "border-emerald-500/60", bg: "bg-emerald-500/12", glow: "" }
  if (status === "reserved") return { border: "border-blue-500/60", bg: "bg-blue-500/12", glow: "" }
  if (status === "arriving-soon") return { border: "border-amber-500/60", bg: "bg-amber-500/15", glow: "" }
  if (status === "high-risk") {
    return {
      border: "border-rose-500/70",
      bg: "bg-rose-500/15",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    }
  }
  if (status === "seated") return { border: "border-emerald-500/60", bg: "bg-emerald-500/20", glow: "" }
  if (status === "completed") return { border: "border-zinc-600", bg: "bg-zinc-700/20", glow: "" }
  return { border: "border-zinc-600 border-dashed", bg: "bg-zinc-800/15", glow: "" }
}

export function getRevenueHeatColor(value: number): string {
  if (value < 40) return "bg-emerald-500/10"
  if (value < 80) return "bg-emerald-500/20"
  if (value < 120) return "bg-amber-500/25"
  return "bg-rose-500/20"
}

export function getTurnTimeHeatColor(turn: TurnTimeInfo): string {
  if (turn.status === "fast") return "bg-emerald-500/15"
  if (turn.status === "on-target") return "bg-amber-500/18"
  return "bg-rose-500/20"
}

export function getCourseLabel(course: CourseState): string {
  const labels: Record<CourseState, string> = {
    welcome: "Welcome",
    apps: "Apps",
    mains: "Mains",
    dessert: "Dessert",
    paying: "Paying",
    "check-printed": "Check Printed",
    "check-requested": "Check Requested",
  }
  return labels[course]
}
