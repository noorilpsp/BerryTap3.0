const STORAGE_PREFIX = "floor_map_floorplan_";
const GLOBAL_STORAGE_KEY = "floor_map_floorplan_last";

function keyForLocation(locationId: string): string {
  return `${STORAGE_PREFIX}${locationId}`;
}

export function getLastViewedFloorplanClient(locationId: string | null | undefined): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (locationId) {
      const value = window.localStorage.getItem(keyForLocation(locationId));
      if (value?.trim()) return value;
    }
    const globalValue = window.localStorage.getItem(GLOBAL_STORAGE_KEY);
    return globalValue?.trim() ? globalValue : null;
  } catch {
    return null;
  }
}

export function getLastViewedFloorplanClientGlobal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(GLOBAL_STORAGE_KEY);
    return value?.trim() ? value : null;
  } catch {
    return null;
  }
}

export function setLastViewedFloorplanClient(
  locationId: string | null | undefined,
  floorplanId: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    if (locationId) {
      const key = keyForLocation(locationId);
      if (!floorplanId?.trim()) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, floorplanId);
      }
    }
    if (!floorplanId?.trim()) {
      window.localStorage.removeItem(GLOBAL_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(GLOBAL_STORAGE_KEY, floorplanId);
  } catch {
    // Ignore storage failures; server cookie remains the source of truth.
  }
}
