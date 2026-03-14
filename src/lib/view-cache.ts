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
  return tableCache.view;
}

function tableMatchesRequestId(view: TableView, tableId: string): boolean {
  if (!view.table) return false;
  return (
    view.table.id === tableId ||
    (view.table.displayId != null &&
      view.table.displayId.toLowerCase() === tableId.toLowerCase())
  );
}

export function setTableCache(tableId: string, view: TableView): void {
  if (!tableMatchesRequestId(view, tableId)) return;
  tableCache = { tableId, view };
}

/** Clear floor map cache when location matches. Call after seating so next mount/refresh is fresh. */
export function invalidateFloorMapCache(locationId: string): void {
  if (floorMapCache && floorMapCache.locationId === locationId) {
    floorMapCache = null;
  }
}

/** Clear table cache when table matches (id or displayId). Call after seating at that table. */
export function invalidateTableCache(tableId: string): void {
  if (!tableCache || !tableCache.view.table) return;
  const t = tableCache.view.table;
  const matches =
    t.id === tableId ||
    (t.displayId != null && t.displayId.toLowerCase() === tableId.toLowerCase());
  if (matches) {
    tableCache = null;
  }
}

export const OPS_POST_SEATING_EVENT = "ops:post-seating";

export type PostSeatingDetail = { locationId: string; tableId?: string };

/** Invalidate caches and notify mounted views to refresh. Call after Seat Now or Seat from Waitlist. */
export function postSeatingInvalidate(locationId: string, tableId?: string): void {
  invalidateFloorMapCache(locationId);
  if (tableId) invalidateTableCache(tableId);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<PostSeatingDetail>(OPS_POST_SEATING_EVENT, {
        detail: { locationId, tableId },
      })
    );
  }
}
