/**
 * Module-level cache for last-known FloorMapView and TableView.
 * Used to show cached content immediately on remount, then refresh silently.
 * Server remains source of truth; cache is for perceived speed only.
 */

import type { FloorMapView } from "@/lib/floor-map/floorMapView";
import type { TableView } from "@/lib/pos/tableView";

// Floor map: key = locationId + floorplanId (never locationId-only)
let floorMapCache: { locationId: string; floorplanId: string; view: FloorMapView } | null = null;

// Table: key = tableId
let tableCache: { tableId: string; view: TableView } | null = null;

function floorMapKey(locationId: string, floorplanId: string | null): string {
  return `${locationId}|${floorplanId ?? "active"}`;
}

export function getFloorMapCache(
  locationId: string,
  floorplanId: string | null
): FloorMapView | null {
  if (!floorMapCache) return null;
  const key = floorMapKey(locationId, floorplanId);
  const cachedKey = floorMapKey(floorMapCache.locationId, floorMapCache.floorplanId);
  if (key === cachedKey) return floorMapCache.view;
  // Fallback: when floorplanId is null (first render before getActiveFloorplanDb), return cache for same location
  if (floorplanId == null && floorMapCache.locationId === locationId) return floorMapCache.view;
  return null;
}

export function setFloorMapCache(
  locationId: string,
  floorplanId: string | null,
  view: FloorMapView
): void {
  const fpId = view.floorplan?.activeId ?? floorplanId ?? "active";
  floorMapCache = { locationId, floorplanId: fpId, view };
}

export function getTableCache(tableId: string): TableView | null {
  if (!tableCache) return null;
  if (tableCache.tableId !== tableId) return null;
  if (tableCache.view.table?.id !== tableId) return null;
  return tableCache.view;
}

export function setTableCache(tableId: string, view: TableView): void {
  if (view.table?.id !== tableId) return;
  tableCache = { tableId, view };
}
