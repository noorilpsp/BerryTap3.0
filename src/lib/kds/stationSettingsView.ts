/**
 * Station settings read model — shape returned by GET /api/kds/stations.
 */

export type StationSettingsStation = {
  id: string;
  key: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
};

export type StationSettingsView = {
  location: { id: string; name?: string };
  stations: StationSettingsStation[];
};

export function isStationSettingsView(v: unknown): v is StationSettingsView {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!o.location || typeof o.location !== "object") return false;
  const loc = o.location as Record<string, unknown>;
  if (typeof loc.id !== "string") return false;
  if (!Array.isArray(o.stations)) return false;
  return o.stations.every((s) => {
    if (!s || typeof s !== "object") return false;
    const t = s as Record<string, unknown>;
    return (
      typeof t.id === "string" &&
      typeof t.key === "string" &&
      typeof t.name === "string" &&
      typeof t.displayOrder === "number" &&
      typeof t.isActive === "boolean"
    );
  });
}
