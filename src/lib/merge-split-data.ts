// ── Types ──────────────────────────────────────────────────────────────────

export type MergeStatus = "in_use" | "reserved" | "scheduled"
export type SplitTiming = "now" | "when_leaves" | "specific_time"
export type MergeType = "time_limited" | "until_split" | "permanent"

export interface MergeReservation {
  guest: string
  partySize: number
  tags: string[]
  seatedAt?: string
  reservedFor?: string
  estimatedEnd: string
}

export interface ActiveMerge {
  id: string
  tables: string[]
  combinedSeats: number
  zone: string
  status: MergeStatus
  reservation: MergeReservation
  createdAt: string
  createdBy: string
  autoSplitAt: string
  conflictNote: string | null
}

export interface CompatibleCombination {
  tables: string[]
  seats: number[]
  combined: number
  zone: string
  position: string
  available: boolean
  reason?: string
}

export interface MergeHistoryEntry {
  tables: string[]
  date: string
  time: string
  guest: string
  status: "active" | "completed"
  duration?: number
  autoSplit?: boolean
  splitBy?: string
  createdBy?: string
}

export interface PendingLargeParty {
  source: "waitlist" | "reservation"
  guest: string
  partySize: number
  waitingSince?: string
  time?: string
  tableAssigned: string | null
}

export interface MergeSuggestionOption {
  tables: string[]
  combinedSeats: number
  pros: string[]
  warnings: string[]
  impact: string
  recommended?: boolean
}

export interface MergeSuggestion {
  party: PendingLargeParty
  options: MergeSuggestionOption[]
}

export interface FloorTable {
  id: string
  number: number
  seats: number
  zone: string
  x: number
  y: number
  width: number
  height: number
  status: "free" | "occupied" | "reserved" | "merged"
  mergeId?: string
}

// ── Table Layout ───────────────────────────────────────────────────────────

export const floorTables: FloorTable[] = [
  // Main Dining - top left cluster (2-tops)
  { id: "T1", number: 1, seats: 2, zone: "Main Dining", x: 60, y: 60, width: 64, height: 64, status: "free" },
  { id: "T3", number: 3, seats: 2, zone: "Main Dining", x: 160, y: 60, width: 64, height: 64, status: "free" },
  { id: "T4", number: 4, seats: 2, zone: "Main Dining", x: 60, y: 160, width: 64, height: 64, status: "free" },
  { id: "T5", number: 5, seats: 2, zone: "Main Dining", x: 160, y: 160, width: 64, height: 64, status: "free" },

  // Main Dining - center (T7 standalone 4-top)
  { id: "T7", number: 7, seats: 4, zone: "Main Dining", x: 400, y: 60, width: 88, height: 72, status: "occupied" },

  // Main Dining - center pair (merged T8+T9)
  { id: "T8", number: 8, seats: 4, zone: "Main Dining", x: 310, y: 180, width: 88, height: 72, status: "merged", mergeId: "merge_001" },
  { id: "T9", number: 9, seats: 4, zone: "Main Dining", x: 430, y: 180, width: 88, height: 72, status: "merged", mergeId: "merge_001" },

  // Main Dining - lower row
  { id: "T10", number: 10, seats: 4, zone: "Main Dining", x: 60, y: 310, width: 88, height: 72, status: "free" },
  { id: "T12", number: 12, seats: 4, zone: "Main Dining", x: 190, y: 310, width: 88, height: 72, status: "free" },
  { id: "T14", number: 14, seats: 4, zone: "Main Dining", x: 370, y: 310, width: 88, height: 72, status: "occupied" },

  // Main Dining - bottom row
  { id: "T15", number: 15, seats: 4, zone: "Main Dining", x: 60, y: 430, width: 88, height: 72, status: "free" },
  { id: "T16", number: 16, seats: 4, zone: "Main Dining", x: 190, y: 430, width: 88, height: 72, status: "free" },
  { id: "T17", number: 17, seats: 6, zone: "Main Dining", x: 340, y: 430, width: 100, height: 72, status: "free" },

  // Patio
  { id: "T18", number: 18, seats: 2, zone: "Patio", x: 60, y: 590, width: 64, height: 64, status: "free" },
  { id: "T19", number: 19, seats: 4, zone: "Patio", x: 160, y: 590, width: 88, height: 64, status: "free" },
  { id: "T20", number: 20, seats: 4, zone: "Patio", x: 280, y: 590, width: 88, height: 64, status: "free" },
  { id: "T21", number: 21, seats: 2, zone: "Patio", x: 400, y: 590, width: 64, height: 64, status: "free" },
  { id: "T22", number: 22, seats: 6, zone: "Patio", x: 500, y: 590, width: 100, height: 64, status: "free" },

  // Private Room
  { id: "T23", number: 23, seats: 6, zone: "Private Room", x: 600, y: 60, width: 100, height: 72, status: "merged", mergeId: "merge_002" },
  { id: "T24", number: 24, seats: 4, zone: "Private Room", x: 730, y: 60, width: 88, height: 72, status: "merged", mergeId: "merge_002" },
  { id: "T25", number: 25, seats: 4, zone: "Private Room", x: 660, y: 180, width: 88, height: 72, status: "free" },
]

// ── Active Merges ─────────────────────────────────────────────────────────

export const activeMerges: ActiveMerge[] = [
  {
    id: "merge_001",
    tables: ["T8", "T9"],
    combinedSeats: 8,
    zone: "Main Dining",
    status: "in_use",
    reservation: {
      guest: "O'Brien",
      partySize: 6,
      tags: ["birthday"],
      seatedAt: "2025-01-17T19:00:00",
      estimatedEnd: "2025-01-17T21:30:00",
    },
    createdAt: "2025-01-17T18:45:00",
    createdBy: "Maria",
    autoSplitAt: "2025-01-17T21:00:00",
    conflictNote: "Nakamura (3p) on T9 at 9:00 PM",
  },
  {
    id: "merge_002",
    tables: ["T23", "T24"],
    combinedSeats: 10,
    zone: "Private Room",
    status: "reserved",
    reservation: {
      guest: "Corporate Dinner",
      partySize: 8,
      tags: ["pre-order-wine", "merged"],
      reservedFor: "2025-01-17T20:00:00",
      estimatedEnd: "2025-01-17T22:30:00",
    },
    createdAt: "2025-01-16T14:00:00",
    createdBy: "Maria",
    autoSplitAt: "2025-01-17T22:30:00",
    conflictNote: null,
  },
]

// ── Compatible Combinations ───────────────────────────────────────────────

export const compatibleCombinations: CompatibleCombination[] = [
  { tables: ["T1", "T3"], seats: [2, 2], combined: 4, zone: "Main Dining", position: "left", available: true },
  { tables: ["T4", "T5"], seats: [2, 2], combined: 4, zone: "Main Dining", position: "left", available: true },
  { tables: ["T1", "T4"], seats: [2, 2], combined: 4, zone: "Main Dining", position: "left-col", available: true },
  { tables: ["T3", "T5"], seats: [2, 2], combined: 4, zone: "Main Dining", position: "left-inner", available: true },
  { tables: ["T8", "T9"], seats: [4, 4], combined: 8, zone: "Main Dining", position: "center", available: false, reason: "Currently merged" },
  { tables: ["T10", "T12"], seats: [4, 4], combined: 8, zone: "Main Dining", position: "lower-left", available: true },
  { tables: ["T15", "T16"], seats: [4, 4], combined: 8, zone: "Main Dining", position: "bottom-left", available: true },
  { tables: ["T16", "T17"], seats: [4, 6], combined: 10, zone: "Main Dining", position: "bottom-right", available: true },
  { tables: ["T15", "T16", "T17"], seats: [4, 4, 6], combined: 14, zone: "Main Dining", position: "entire-bottom", available: true },
  { tables: ["T18", "T19"], seats: [2, 4], combined: 6, zone: "Patio", position: "left", available: true },
  { tables: ["T19", "T20"], seats: [4, 4], combined: 8, zone: "Patio", position: "center", available: true },
  { tables: ["T20", "T21"], seats: [4, 2], combined: 6, zone: "Patio", position: "center-right", available: true },
  { tables: ["T21", "T22"], seats: [2, 6], combined: 8, zone: "Patio", position: "right", available: true },
  { tables: ["T23", "T24"], seats: [6, 4], combined: 10, zone: "Private Room", position: "upper", available: false, reason: "Currently merged" },
  { tables: ["T24", "T25"], seats: [4, 4], combined: 8, zone: "Private Room", position: "lower", available: false, reason: "T24 in active merge" },
  { tables: ["T23", "T24", "T25"], seats: [6, 4, 4], combined: 14, zone: "Private Room", position: "entire", available: false, reason: "T23+T24 in active merge" },
]

// ── Merge History ─────────────────────────────────────────────────────────

export const mergeHistory: MergeHistoryEntry[] = [
  { tables: ["T8", "T9"], date: "2025-01-17", time: "18:45-active", guest: "O'Brien (6p)", status: "active", createdBy: "Maria" },
  { tables: ["T23", "T24"], date: "2025-01-17", time: "scheduled", guest: "Corporate (8p)", status: "active", createdBy: "Maria" },
  { tables: ["T15", "T16"], date: "2025-01-16", time: "19:00-21:15", guest: "Kowalski (7p)", status: "completed", duration: 135, autoSplit: true },
  { tables: ["T19", "T20"], date: "2025-01-16", time: "20:00-22:00", guest: "Svensson (6p)", status: "completed", duration: 120, autoSplit: false, splitBy: "Carlos" },
  { tables: ["T8", "T9"], date: "2025-01-15", time: "19:30-21:45", guest: "Petrov Business (7p)", status: "completed", duration: 135, autoSplit: true },
  { tables: ["T23", "T24", "T25"], date: "2025-01-14", time: "18:00-22:00", guest: "Private Event (12p)", status: "completed", duration: 240, autoSplit: true },
  { tables: ["T15", "T16"], date: "2025-01-13", time: "20:00-22:00", guest: "Birthday (8p)", status: "completed", duration: 120, autoSplit: true },
  { tables: ["T21", "T22"], date: "2025-01-11", time: "19:00-21:30", guest: "Agarwal (7p)", status: "completed", duration: 150, autoSplit: true },
]

// ── Pending Large Parties ─────────────────────────────────────────────────

export const pendingLargeParties: PendingLargeParty[] = [
  { source: "waitlist", guest: "Mensah Family", partySize: 5, waitingSince: "2025-01-17T19:23:00", tableAssigned: null },
  { source: "reservation", guest: "Smith Party", partySize: 8, time: "2025-01-17T20:30:00", tableAssigned: null },
]

// ── Merge Suggestions ─────────────────────────────────────────────────────

export const mergeSuggestions: MergeSuggestion[] = [
  {
    party: pendingLargeParties[0],
    options: [
      {
        tables: ["T15", "T16"],
        combinedSeats: 8,
        pros: ["Both available now", "Same zone (Main Dining)", "No reservations until 9:30 PM"],
        warnings: ["Removes 2 separate 4-tops from availability"],
        impact: "-1 potential booking for 4-tops at 8:30",
        recommended: true,
      },
      {
        tables: ["T10", "T12"],
        combinedSeats: 8,
        pros: ["T10 available now"],
        warnings: ["T12 available after 7:35 PM (Patel finishing)", "T12 has Chen (VIP) at 7:30 -- must serve first"],
        impact: "Delays seating by ~25 min",
      },
    ],
  },
  {
    party: pendingLargeParties[1],
    options: [
      {
        tables: ["T8", "T9"],
        combinedSeats: 8,
        pros: ["Available after O'Brien leaves (~9:30 PM)"],
        warnings: ["Cutting it close -- only 60 min buffer", "Conflicts with Nakamura (3p) on T9 at 9:00"],
        impact: "May need to resolve Nakamura conflict",
      },
      {
        tables: ["T15", "T16"],
        combinedSeats: 8,
        pros: ["Both available at 8:30 PM", "No conflicts"],
        warnings: [],
        impact: "No negative impact",
        recommended: true,
      },
    ],
  },
]

// ── Adjacency Map ─────────────────────────────────────────────────────────

export const adjacencyMap: Record<string, string[]> = {
  T1: ["T3", "T4"],
  T3: ["T1", "T5"],
  T4: ["T1", "T5"],
  T5: ["T3", "T4"],
  T7: [],
  T8: ["T9"],
  T9: ["T8"],
  T10: ["T12"],
  T12: ["T10"],
  T14: [],
  T15: ["T16"],
  T16: ["T15", "T17"],
  T17: ["T16"],
  T18: ["T19"],
  T19: ["T18", "T20"],
  T20: ["T19", "T21"],
  T21: ["T20", "T22"],
  T22: ["T21"],
  T23: ["T24"],
  T24: ["T23", "T25"],
  T25: ["T24"],
}

// ── Helper: Get tables for a merge ────────────────────────────────────────

export function getMergeTables(mergeId: string): FloorTable[] {
  return floorTables.filter((t) => t.mergeId === mergeId)
}

export function getTableById(id: string): FloorTable | undefined {
  return floorTables.find((t) => t.id === id)
}

export function isTableInActiveMerge(tableId: string): boolean {
  return activeMerges.some((m) => m.tables.includes(tableId))
}

export function getActiveMergeForTable(tableId: string): ActiveMerge | undefined {
  return activeMerges.find((m) => m.tables.includes(tableId))
}

export function getAdjacentTables(tableId: string): string[] {
  return adjacencyMap[tableId] || []
}

export function canMergeTables(tableIds: string[]): boolean {
  if (tableIds.length < 2) return false
  // Check all are adjacent to at least one other in the set
  for (const id of tableIds) {
    const adj = getAdjacentTables(id)
    const hasAdjInSet = tableIds.some((other) => other !== id && adj.includes(other))
    if (!hasAdjInSet) return false
  }
  // Check none are in an active merge
  return !tableIds.some((id) => isTableInActiveMerge(id))
}
