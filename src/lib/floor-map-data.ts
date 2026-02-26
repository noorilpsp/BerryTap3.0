import type { StoreTable } from "@/store/types"
import { restaurantStore } from "@/store/restaurantStore"

// ── Types ────────────────────────────────────────────────────────────────────

export type FloorTableStatus = "free" | "active" | "urgent" | "billing" | "closed"
export type MealStage = "drinks" | "food" | "dessert" | "bill"
export type AlertType = "food_ready" | "no_checkin" | "waiting"
/** Section id - legacy (patio|bar|main) or custom from floor plan sections */
export type SectionId = string
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

export const defaultSectionConfig: Record<string, { name: string }> = {
  patio: { name: "Patio" },
  bar: { name: "Bar Area" },
  main: { name: "Main Dining" },
}

/** @deprecated use buildSectionConfig */
export const sectionConfig = defaultSectionConfig

/** Build section config from floor plan sections, or return default */
export function buildSectionConfig(
  sections?: { id: string; name: string }[] | null
): Record<string, { name: string }> {
  if (!sections || sections.length === 0) return defaultSectionConfig
  return Object.fromEntries(sections.map((s) => [s.id, { name: s.name }]))
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

// Tables are read from the restaurant store. This mapper converts StoreTable to FloorTable for floor components.
function mapStoreStatusToFloor(s: StoreTable["status"]): FloorTableStatus {
  if (s === "reserved" || s === "cleaning") return "free"
  return s
}

function mapStoreSectionToFloor(s: string | undefined): string {
  if (!s || s === "private") return "main"
  return s
}

export function storeTablesToFloorTables(tables: StoreTable[]): FloorTable[] {
  return tables.map((t) => ({
    id: t.id,
    number: t.number,
    section: mapStoreSectionToFloor(t.section),
    status: mapStoreStatusToFloor(t.status),
    capacity: t.capacity,
    guests: t.guests ?? 0,
    stage: t.stage ?? null,
    position: t.position,
    shape: t.shape,
    server: t.serverId ?? null,
    seatedAt: t.seatedAt ?? undefined,
    alerts: t.alerts,
    combinedWith: t.combinedWith,
    width: t.width,
    height: t.height,
    rotation: t.rotation,
  }))
}

/** Non-reactive getter for floor tables from store (e.g. in callbacks). For React components, use useRestaurantStore(s => storeTablesToFloorTables(s.tables)). */
export function getFloorTables(): FloorTable[] {
  return storeTablesToFloorTables(restaurantStore.getState().getTables())
}

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
      const secName = (sectionConfig[t.section]?.name ?? t.section ?? "").toLowerCase().replace(/\s/g, "")
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

export function getSectionBounds(sectionId: string, allTables: FloorTable[]) {
  const sectionTables = allTables.filter((t) => t.section === sectionId)
  if (sectionTables.length === 0) return null

  const padding = 40
  const minX = Math.min(...sectionTables.map((t) => t.position.x)) - padding
  const minY = Math.min(...sectionTables.map((t) => t.position.y)) - padding
  const maxX = Math.max(...sectionTables.map((t) => t.position.x)) + padding
  const maxY = Math.max(...sectionTables.map((t) => t.position.y)) + padding

  return { x: minX, y: minY, width: maxX - minX + 60, height: maxY - minY + 60 }
}
