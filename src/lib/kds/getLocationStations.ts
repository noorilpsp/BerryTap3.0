import { db } from "@/db";
import { locationStations } from "@/lib/db/schema/location-stations";
import { eq, and, asc } from "drizzle-orm";

export type LocationStationRow = {
  id: string;
  key: string;
  name: string;
  displayOrder: number;
};

export type LocationStationCatalogRow = LocationStationRow & {
  isActive: boolean;
};

/**
 * Get active stations for a location, ordered by display_order.
 * Returns the source-of-truth station list for KDS settings and display.
 */
export async function getLocationStations(locationId: string): Promise<LocationStationRow[]> {
  const rows = await db.query.locationStations.findMany({
    where: and(
      eq(locationStations.locationId, locationId),
      eq(locationStations.isActive, true)
    ),
    columns: { id: true, key: true, name: true, displayOrder: true },
    orderBy: [asc(locationStations.displayOrder), asc(locationStations.key)],
  });
  return rows;
}

/**
 * Get full station catalog for KDS: all stations (active + inactive) to distinguish
 * catalog entries from orphan keys in order/item data.
 * Used to build KDS tabs: primary = active, orphans = keys in data but not in catalog.
 */
export async function getLocationStationsCatalog(
  locationId: string
): Promise<LocationStationCatalogRow[]> {
  const rows = await db.query.locationStations.findMany({
    where: eq(locationStations.locationId, locationId),
    columns: { id: true, key: true, name: true, displayOrder: true, isActive: true },
    orderBy: [asc(locationStations.displayOrder), asc(locationStations.key)],
  });
  return rows;
}

/**
 * First active station key for a location (by display_order).
 * Use as routing fallback when no explicit override or menu default exists.
 */
export async function getFirstActiveStationKey(locationId: string): Promise<string | null> {
  const stations = await getLocationStations(locationId);
  return stations.length > 0 ? stations[0].key : null;
}

export type ActiveStationKeysForRouting = {
  validKeys: Set<string>;
  firstKey: string | null;
};

/**
 * Load active station keys once for routing. Use to validate input/menu defaults
 * and resolve fallback without repeated DB queries.
 */
export async function getActiveStationKeysForRouting(
  locationId: string
): Promise<ActiveStationKeysForRouting> {
  const stations = await getLocationStations(locationId);
  const validKeys = new Set(stations.map((s) => s.key));
  const firstKey = stations.length > 0 ? stations[0].key : null;
  return { validKeys, firstKey };
}

/**
 * Check whether a station key is valid for a location (exists in location_stations, is_active).
 * Non-breaking: does not throw. Use for validation warnings only.
 */
export async function isValidLocationStation(
  locationId: string,
  stationKey: string | null | undefined
): Promise<boolean> {
  if (!stationKey?.trim()) return false;
  const stations = await getLocationStations(locationId);
  return stations.some((s) => s.key === stationKey);
}
