"use client";

import type { FloorMapView } from "@/lib/floor-map/floorMapView";
import { isFloorMapView } from "@/lib/floor-map/floorMapView";
import { getFloorMapCache, setFloorMapCache } from "@/lib/view-cache";

/** Warm multi-entry floor map cache; no-op if already cached or request fails. */
export async function prefetchFloorMapView(
  locationId: string,
  floorplanId: string
): Promise<FloorMapView | null> {
  if (!locationId?.trim() || !floorplanId?.trim()) return null;
  const cached = getFloorMapCache(locationId, floorplanId);
  if (cached) return cached;
  try {
    const params = new URLSearchParams({ locationId, floorplanId });
    const res = await fetch(`/api/floor-map/view?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || payload?.ok === false) {
      return null;
    }
    const data = payload?.data;
    if (!isFloorMapView(data)) {
      return null;
    }
    setFloorMapCache(locationId, floorplanId, data);
    return data;
  } catch {
    return null;
  }
}
