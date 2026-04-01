export type RawWaveItemStatus =
  | "held"
  | "pending"
  | "sent"
  | "confirmed"
  | "cooking"
  | "preparing"
  | "ready"
  | "served"
  | "void"
  | "cancelled"

export type CanonicalWaveStatus = "held" | "fired" | "cooking" | "ready" | "served"
export type StoreLikeWaveStatus = "held" | "sent" | "cooking" | "ready" | "served"
export type TablePageWaveStatus = "held" | "fired" | "preparing" | "ready" | "served"
export type DetailWaveStatus = "held" | "fired" | "cooking" | "ready" | "served"

function normalizeRawWaveItemStatus(
  status: RawWaveItemStatus
): CanonicalWaveStatus | "void" {
  if (status === "served") return "served"
  if (status === "ready") return "ready"
  if (status === "cooking" || status === "preparing") return "cooking"
  if (status === "sent" || status === "confirmed") return "fired"
  if (status === "void" || status === "cancelled") return "void"
  return "held"
}

export function deriveCanonicalWaveStatusFromItemStatuses(
  statuses: readonly RawWaveItemStatus[]
): CanonicalWaveStatus {
  const activeStatuses = statuses
    .map(normalizeRawWaveItemStatus)
    .filter((status): status is CanonicalWaveStatus => status !== "void")

  if (activeStatuses.length === 0) return "held"
  if (activeStatuses.every((status) => status === "served")) return "served"

  const allReadyOrServed = activeStatuses.every(
    (status) => status === "ready" || status === "served"
  )
  if (allReadyOrServed && activeStatuses.some((status) => status === "ready")) {
    return "ready"
  }

  if (activeStatuses.some((status) => status === "cooking")) return "cooking"
  if (activeStatuses.some((status) => status === "fired")) return "fired"
  return "held"
}

export function deriveCanonicalWaveStatusFromItems<T extends { status: RawWaveItemStatus }>(
  items: readonly T[]
): CanonicalWaveStatus {
  return deriveCanonicalWaveStatusFromItemStatuses(items.map((item) => item.status))
}

export function mapCanonicalWaveStatusToStoreLikeStatus(
  status: CanonicalWaveStatus
): StoreLikeWaveStatus {
  if (status === "fired") return "sent"
  return status
}

export function mapStoreLikeWaveStatusToCanonical(
  status: StoreLikeWaveStatus
): CanonicalWaveStatus {
  if (status === "sent") return "fired"
  return status
}

export function mapCanonicalWaveStatusToTablePageStatus(
  status: CanonicalWaveStatus
): TablePageWaveStatus {
  if (status === "cooking") return "preparing"
  return status
}

export function mapCanonicalWaveStatusToDetailStatus(
  status: CanonicalWaveStatus
): DetailWaveStatus {
  return status
}

/**
 * Normalize raw item status when wave firedAt is known. Used so that a fired wave
 * (order.firedAt set) shows as "fired" even while items are still "pending" in DB.
 * Matches table page mapItemStatus + mapWaveStatus behavior.
 */
function normalizeRawWaveItemStatusWithFiredAt(
  status: RawWaveItemStatus,
  firedAt: Date | null
): CanonicalWaveStatus | "void" {
  if (status === "served") return "served"
  if (status === "ready") return "ready"
  if (status === "cooking" || status === "preparing") return "cooking"
  if (status === "void" || status === "cancelled") return "void"
  if (status === "pending" || status === "sent" || status === "confirmed" || status === "held") {
    return firedAt ? "fired" : "held"
  }
  return firedAt ? "fired" : "held"
}

/**
 * Derive TablePageWaveStatus from raw item statuses and wave firedAt.
 * Single source of truth for wave status/label on both table page and floor map.
 * Returns: held | fired (label "New") | preparing | ready | served.
 */
export function deriveTablePageWaveStatusFromItems(
  rawStatuses: readonly RawWaveItemStatus[],
  firedAt: Date | null
): TablePageWaveStatus {
  const active = rawStatuses
    .map((s) => normalizeRawWaveItemStatusWithFiredAt(s, firedAt))
    .filter((s): s is CanonicalWaveStatus => s !== "void")
  if (active.length === 0) return "held"
  if (active.every((s) => s === "served")) return "served"
  const allReadyOrServed = active.every((s) => s === "ready" || s === "served")
  if (allReadyOrServed && active.some((s) => s === "ready")) return "ready"
  if (active.some((s) => s === "cooking")) return "preparing"
  if (active.some((s) => s === "fired") || firedAt) return "fired"
  return "held"
}
