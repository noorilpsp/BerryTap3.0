/**
 * Resolved station for an item: override > order.station > fallback.
 * Shared between KDS page and mutations for consistent station routing.
 */
export function resolveItemStation(
  item: { stationOverride?: string | null },
  order: { station?: string | null },
  fallbackStationId: string
): string {
  return item.stationOverride ?? order.station ?? fallbackStationId;
}
