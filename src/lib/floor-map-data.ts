// ── Types ────────────────────────────────────────────────────────────────────

export type FloorTableStatus = "free" | "active" | "urgent" | "billing" | "closed"
export type MealStage = "drinks" | "food" | "dessert" | "bill"
export type AlertType = "food_ready" | "no_checkin" | "waiting"
export type SectionId = "patio" | "bar" | "main"
export type FilterMode = "all" | "my_section" | "my_tables"
export type ViewMode = "grid" | "map"

export type TableShape = "round" | "square" | "rectangle" | "booth"

export interface FloorTable {
  id: string
  number: number
  section: SectionId
  status: FloorTableStatus
  capacity: number
  guests: number
  stage: MealStage | null
  position: { x: number; y: number }
  shape: TableShape
  server: string | null
  seatedAt?: string
  alerts?: AlertType[]
  combinedWith?: string
  // Builder layout properties
  width?: number
  height?: number
  rotation?: number
}

export interface Section {
  id: SectionId
  name: string
  tables: string[]
}

export interface Restaurant {
  id: string
  name: string
  sections: Section[]
}

export interface CurrentServer {
  id: string
  name: string
  section: SectionId
  assignedTables: string[]
}

export interface CombinedTable {
  tables: string[]
  guests: number
  status: FloorTableStatus
  stage: MealStage
}

// ── Config ───────────────────────────────────────────────────────────────────

export const floorStatusConfig: Record<
  FloorTableStatus,
  { color: string; darkColor: string; label: string; pulse?: boolean }
> = {
  free: { color: "#10b981", darkColor: "#34d399", label: "Free" },
  active: { color: "#f59e0b", darkColor: "#fbbf24", label: "Active" },
  urgent: { color: "#ef4444", darkColor: "#f87171", label: "Urgent", pulse: true },
  billing: { color: "#3b82f6", darkColor: "#60a5fa", label: "Billing" },
  closed: { color: "#6b7280", darkColor: "#9ca3af", label: "Closed" },
}

export const stageConfig: Record<MealStage, { icon: string; label: string }> = {
  drinks: { icon: "\u{1F377}", label: "Drinks" },
  food: { icon: "\u{1F37D}\uFE0F", label: "Food" },
  dessert: { icon: "\u{1F370}", label: "Dessert" },
  bill: { icon: "\u{1F4B3}", label: "Bill" },
}

export const sectionConfig: Record<SectionId, { name: string }> = {
  patio: { name: "Patio" },
  bar: { name: "Bar Area" },
  main: { name: "Main Dining" },
}

export const alertMessages: Record<AlertType, string> = {
  food_ready: "Food ready for pickup",
  no_checkin: "No check-in 15m",
  waiting: "Waiting for service",
}

// ── Mock Data ────────────────────────────────────────────────────────────────

export const restaurant: Restaurant = {
  id: "rest_01",
  name: "Bella Vista",
  sections: [
    { id: "patio", name: "Patio", tables: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"] },
    { id: "bar", name: "Bar Area", tables: ["t10", "t11", "t12", "t13"] },
    { id: "main", name: "Main Dining", tables: ["t14", "t15", "t16", "t17", "t18", "t19"] },
  ],
}

export const tables: FloorTable[] = [
  // Patio (outdoor tables - mix of rounds and squares)
  { id: "t1", number: 1, section: "patio", status: "free", capacity: 2, guests: 0, stage: null, position: { x: 90, y: 120 }, shape: "round", server: null },
  { id: "t2", number: 2, section: "patio", status: "free", capacity: 2, guests: 0, stage: null, position: { x: 255, y: 120 }, shape: "round", server: null },
  { id: "t3", number: 3, section: "patio", status: "free", capacity: 4, guests: 0, stage: null, position: { x: 420, y: 120 }, shape: "square", server: null },
  { id: "t4", number: 4, section: "patio", status: "active", capacity: 4, guests: 3, stage: "drinks", position: { x: 90, y: 285 }, shape: "square", server: "s1", seatedAt: "2026-02-08T19:15:00Z" },
  { id: "t5", number: 5, section: "patio", status: "urgent", capacity: 4, guests: 4, stage: "food", position: { x: 255, y: 285 }, shape: "square", server: "s1", seatedAt: "2026-02-08T18:43:00Z", alerts: ["food_ready"] },
  { id: "t6", number: 6, section: "patio", status: "active", capacity: 2, guests: 2, stage: "food", position: { x: 420, y: 285 }, shape: "round", server: "s2", seatedAt: "2026-02-08T19:30:00Z" },
  { id: "t7", number: 7, section: "patio", status: "free", capacity: 6, guests: 0, stage: null, position: { x: 90, y: 450 }, shape: "rectangle", server: null },
  { id: "t8", number: 8, section: "patio", status: "active", capacity: 4, guests: 2, stage: "dessert", position: { x: 255, y: 450 }, shape: "square", server: "s1", seatedAt: "2026-02-08T18:20:00Z" },
  { id: "t9", number: 9, section: "patio", status: "free", capacity: 2, guests: 0, stage: null, position: { x: 420, y: 450 }, shape: "round", server: null },
  // Bar (high-tops and booths)
  { id: "t10", number: 10, section: "bar", status: "active", capacity: 2, guests: 2, stage: "drinks", position: { x: 690, y: 165 }, shape: "round", server: "s2", seatedAt: "2026-02-08T19:45:00Z" },
  { id: "t11", number: 11, section: "bar", status: "active", capacity: 2, guests: 1, stage: "food", position: { x: 855, y: 165 }, shape: "round", server: "s2", seatedAt: "2026-02-08T19:20:00Z" },
  { id: "t12", number: 12, section: "bar", status: "active", capacity: 4, guests: 4, stage: "food", position: { x: 690, y: 330 }, shape: "booth", server: "s1", seatedAt: "2026-02-08T18:52:00Z" },
  { id: "t13", number: 13, section: "bar", status: "urgent", capacity: 4, guests: 2, stage: "food", position: { x: 855, y: 330 }, shape: "booth", server: "s1", seatedAt: "2026-02-08T18:30:00Z", alerts: ["no_checkin"] },
  // Main Dining (booths, rectangles for large groups, and 2-tops)
  { id: "t14", number: 14, section: "main", status: "free", capacity: 4, guests: 0, stage: null, position: { x: 1125, y: 120 }, shape: "booth", server: null },
  { id: "t15", number: 15, section: "main", status: "free", capacity: 6, guests: 0, stage: null, position: { x: 1290, y: 120 }, shape: "rectangle", server: null },
  { id: "t16", number: 16, section: "main", status: "active", capacity: 8, guests: 6, stage: "food", position: { x: 1455, y: 120 }, shape: "rectangle", server: "s3", seatedAt: "2026-02-08T19:00:00Z" },
  { id: "t17", number: 17, section: "main", status: "urgent", capacity: 4, guests: 3, stage: "food", position: { x: 1125, y: 285 }, shape: "square", server: "s3", seatedAt: "2026-02-08T18:35:00Z", alerts: ["food_ready"] },
  { id: "t18", number: 18, section: "main", status: "active", capacity: 2, guests: 2, stage: "dessert", position: { x: 1290, y: 285 }, shape: "round", server: "s3", seatedAt: "2026-02-08T18:15:00Z" },
  { id: "t19", number: 19, section: "main", status: "billing", capacity: 6, guests: 4, stage: "bill", position: { x: 1455, y: 285 }, shape: "rectangle", server: "s3", seatedAt: "2026-02-08T17:50:00Z" },
]

export const combinedTables: CombinedTable[] = []

export const currentServer: CurrentServer = {
  id: "s1",
  name: "Sarah",
  section: "patio",
  assignedTables: ["t4", "t5", "t8", "t12", "t13"],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getStatusCounts(tableList: FloorTable[]) {
  return {
    free: tableList.filter((t) => t.status === "free").length,
    active: tableList.filter((t) => t.status === "active").length,
    urgent: tableList.filter((t) => t.status === "urgent").length,
    billing: tableList.filter((t) => t.status === "billing").length,
    closed: tableList.filter((t) => t.status === "closed").length,
  }
}

export function filterTablesByMode(
  allTables: FloorTable[],
  mode: FilterMode,
  server: CurrentServer
): FloorTable[] {
  switch (mode) {
    case "my_section":
      return allTables.filter((t) => t.section === server.section)
    case "my_tables":
      return allTables.filter((t) => server.assignedTables.includes(t.id))
    default:
      return allTables
  }
}

export function filterTablesByStatus(
  allTables: FloorTable[],
  status: FloorTableStatus | null
): FloorTable[] {
  if (!status) return allTables
  return allTables.filter((t) => t.status === status)
}

export function searchTables(
  allTables: FloorTable[],
  query: string
): FloorTable[] {
  if (!query) return []
  const q = query.toLowerCase().trim().replace(/\s+/g, "")

  const scored = allTables
    .map((t) => {
      let score = 0
      const num = t.number.toString()
      const numQuery = q.replace(/^t/, "")

      // Table number match
      if (num === numQuery) score += 100
      else if (num.startsWith(numQuery)) score += 80
      else if (numQuery && num.includes(numQuery)) score += 60

      // Section name match
      const secName = sectionConfig[t.section].name.toLowerCase().replace(/\s/g, "")
      if (secName.includes(q)) score += 50
      if (secName.startsWith(q)) score += 10

      // Status match
      if (t.status.startsWith(q)) score += 40
      if (q === "urgent" && t.status === "urgent") score += 50
      if (q === "food" && t.alerts?.includes("food_ready")) score += 50
      if (q === "free" && t.status === "free") score += 50

      // Boost urgent
      if (t.status === "urgent") score += 5
      // Boost occupied over free
      if (t.status !== "free" && t.status !== "closed") score += 2

      return { table: t, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map((r) => r.table)
}

export interface SearchHistoryEntry {
  tableId: string
  section: SectionId
  timestamp: string
}

export const defaultSearchHistory: SearchHistoryEntry[] = [
  { tableId: "t12", section: "bar", timestamp: "2026-02-08T20:15:00Z" },
  { tableId: "t5", section: "patio", timestamp: "2026-02-08T20:10:00Z" },
  { tableId: "t13", section: "bar", timestamp: "2026-02-08T20:05:00Z" },
]

export interface QuickSearchAction {
  label: string
  filter: { status?: FloorTableStatus[] }
  count: number
  color: string
}

export function getQuickSearchActions(allTables: FloorTable[]): QuickSearchAction[] {
  const urgentCount = allTables.filter((t) => t.status === "urgent").length
  const foodReadyCount = allTables.filter((t) => t.alerts?.includes("food_ready")).length
  const actions: QuickSearchAction[] = []
  if (urgentCount > 0) actions.push({ label: "Show urgent tables", filter: { status: ["urgent"] }, count: urgentCount, color: "text-red-400" })
  if (foodReadyCount > 0) actions.push({ label: "Tables with food ready", filter: { status: ["urgent"] }, count: foodReadyCount, color: "text-amber-400" })
  return actions
}

export function minutesAgo(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000)
}

// ── Seat Party Helpers ───────────────────────────────────────────────────────

export type DietaryId = "nut_allergy" | "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "shellfish"
export type OccasionId = "birthday" | "anniversary" | "vip" | "graduation" | "celebration"

export const dietaryOptions: { id: DietaryId; label: string }[] = [
  { id: "nut_allergy", label: "Nut allergy" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten-free" },
  { id: "dairy_free", label: "Dairy-free" },
  { id: "shellfish", label: "Shellfish allergy" },
]

export const occasionOptions: { id: OccasionId; label: string }[] = [
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "vip", label: "VIP Guest" },
  { id: "graduation", label: "Graduation" },
  { id: "celebration", label: "Celebration" },
]

export const quickNoteSuggestions = [
  "Prefers window seat",
  "First-time guests",
  "Regular customer",
  "Needs high chair",
  "In a hurry",
]

export interface SeatPartyForm {
  partySize: number
  tableId: string | null
  dietary: { restriction: DietaryId; seats: number[] }[]
  occasion: { type: OccasionId; seat: number | null; notes: string } | null
  notes: string
}

export function getAvailableTables(
  allTables: FloorTable[],
  partySize: number,
  server: CurrentServer
): (FloorTable & { suggested: boolean; reason: string })[] {
  const freeTables = allTables.filter((t) => t.status === "free")

  return freeTables
    .map((t) => {
      let score = 0
      let reason = ""

      // Exact capacity match
      if (t.capacity === partySize) { score += 40; reason = "Exact match" }
      else if (t.capacity >= partySize && t.capacity <= partySize + 2) { score += 20; reason = `${t.capacity}-top` }
      else if (t.capacity >= partySize) { score += 5; reason = "Larger than needed" }
      else { score -= 10; reason = "Too small" }

      // Your section
      if (t.section === server.section) { score += 30; reason += ", your section" }

      const suggested = score >= 40 && t.capacity >= partySize
      return { ...t, suggested, reason }
    })
    .filter((t) => t.capacity >= partySize || t.capacity >= partySize - 1)
    .sort((a, b) => {
      // Suggested first
      if (a.suggested !== b.suggested) return a.suggested ? -1 : 1
      // Then exact capacity
      const aDiff = Math.abs(a.capacity - partySize)
      const bDiff = Math.abs(b.capacity - partySize)
      if (aDiff !== bDiff) return aDiff - bDiff
      // Then own section
      if ((a.section === server.section) !== (b.section === server.section))
        return a.section === server.section ? -1 : 1
      return a.number - b.number
    })
}

export function getSectionBounds(sectionId: SectionId, allTables: FloorTable[]) {
  const sectionTables = allTables.filter((t) => t.section === sectionId)
  if (sectionTables.length === 0) return null

  const padding = 40
  const minX = Math.min(...sectionTables.map((t) => t.position.x)) - padding
  const minY = Math.min(...sectionTables.map((t) => t.position.y)) - padding
  const maxX = Math.max(...sectionTables.map((t) => t.position.x)) + padding
  const maxY = Math.max(...sectionTables.map((t) => t.position.y)) + padding

  return { x: minX, y: minY, width: maxX - minX + 60, height: maxY - minY + 60 }
}
