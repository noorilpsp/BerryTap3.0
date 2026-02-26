"use client"

import type { PlacedElement } from "./floorplan-types"
import type { FloorTable, FloorTableStatus, MealStage, AlertType, TableShape, SectionId } from "./floor-map-data"

/**
 * Floor plan storage - Neon DB (no localStorage).
 * Use floorplan-storage-db for async server actions.
 */
export type { SavedFloorplan } from "./floorplan-storage-db"
export { convertElementsToStoreTables } from "./floorplan-convert"

function getTableShape(element: PlacedElement): TableShape {
  if (element.shape === "circle" || element.shape === "ellipse") return "round"
  if (element.templateId.includes("booth")) return "booth"
  if (element.width > element.height * 1.5) return "rectangle"
  return "square"
}

function assignSection(x: number, y: number, totalWidth: number): SectionId {
  const third = totalWidth / 3
  if (x < third) return "patio"
  if (x < third * 2) return "bar"
  return "main"
}

export function convertElementsToTables(elements: PlacedElement[]): FloorTable[] {
  // Convert elements that have seats (tables and seating like booths)
  const tableElements = elements.filter(el =>
    (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
  )

  if (tableElements.length === 0) return []

  // Calculate bounds for section assignment
  const maxX = Math.max(...tableElements.map(el => el.x), 1000)

  // Deterministic mock data so builder tables look alive (like the demo)
  const statusPatterns: Array<{
    status: FloorTableStatus
    stage: MealStage | null
    server: string | null
    alerts?: AlertType[]
    minutesAgo: number // 0 = free
  }> = [
    { status: "free", stage: null, server: null, minutesAgo: 0 },
    { status: "active", stage: "drinks", server: "s1", minutesAgo: 12 },
    { status: "free", stage: null, server: null, minutesAgo: 0 },
    { status: "active", stage: "food", server: "s2", minutesAgo: 28 },
    { status: "urgent", stage: "food", server: "s1", alerts: ["food_ready"], minutesAgo: 42 },
    { status: "active", stage: "dessert", server: "s1", minutesAgo: 55 },
    { status: "free", stage: null, server: null, minutesAgo: 0 },
    { status: "active", stage: "food", server: "s3", minutesAgo: 20 },
    { status: "billing", stage: "bill", server: "s3", minutesAgo: 68 },
    { status: "active", stage: "drinks", server: "s2", minutesAgo: 8 },
    { status: "urgent", stage: "food", server: "s1", alerts: ["no_checkin"], minutesAgo: 38 },
    { status: "free", stage: null, server: null, minutesAgo: 0 },
    { status: "active", stage: "food", server: "s2", minutesAgo: 32 },
    { status: "active", stage: "dessert", server: "s3", minutesAgo: 50 },
    { status: "free", stage: null, server: null, minutesAgo: 0 },
    { status: "active", stage: "drinks", server: "s1", minutesAgo: 5 },
  ]

  return tableElements.map((el, index) => {
    const tableNumber = index + 1
    const section = assignSection(el.x, el.y, maxX)
    const pattern = statusPatterns[index % statusPatterns.length]
    const capacity = el.seats || 4
    const guests = pattern.status === "free" ? 0 : Math.max(1, Math.min(capacity, Math.ceil(capacity * 0.7)))
    const seatedAt = pattern.minutesAgo > 0
      ? new Date(Date.now() - pattern.minutesAgo * 60 * 1000).toISOString()
      : undefined
    
    return {
      id: `t${tableNumber}`,
      number: tableNumber,
      section,
      status: pattern.status,
      capacity,
      guests,
      stage: pattern.stage,
      position: { x: el.x, y: el.y },
      shape: getTableShape(el),
      server: pattern.server,
      seatedAt,
      alerts: pattern.alerts,
      // Preserve exact builder dimensions and rotation
      width: el.width,
      height: el.height,
      rotation: el.rotation,
    }
  })
}
