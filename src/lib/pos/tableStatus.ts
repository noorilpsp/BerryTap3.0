/**
 * Furniture status: physical table state. Distinct from session/service state (uiMode).
 * DB may store legacy values (available, reserved, unavailable); we normalize for API/UI.
 */
export type FurnitureStatus = "active" | "maintenance" | "disabled"

/**
 * Normalize DB table.status to FurnitureStatus.
 * - "available", "reserved", etc. → "active"
 * - "unavailable" → "maintenance"
 * - "maintenance", "disabled" → as-is
 * - default → "active"
 */
export function normalizeFurnitureStatus(dbStatus: string): FurnitureStatus {
  const s = String(dbStatus ?? "").toLowerCase().trim()
  if (s === "maintenance") return "maintenance"
  if (s === "disabled") return "disabled"
  if (s === "unavailable") return "maintenance"
  return "active"
}
