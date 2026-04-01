import type { TableLane } from "@/lib/timeline-data";

export type ReservationZone = {
  /** Canonical section id (StoreTable.section / lane.zone). */
  id: string;
  /** Human-friendly label. */
  name: string;
};

function titleCaseFromId(id: string): string {
  const cleaned = id
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  if (!cleaned) return "Zone";
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getZoneLabel(
  zoneId: string,
  labelsById?: Readonly<Record<string, string>>
): string {
  const z = zoneId.trim();
  if (!z) return "Zone";
  const mapped = labelsById?.[z]?.trim();
  if (mapped) return mapped;
  return titleCaseFromId(z);
}

/** Build canonical zone list from real table lanes. */
export function getZonesFromTableLanes(
  tableLanes: TableLane[],
  labelsById?: Readonly<Record<string, string>>
): ReservationZone[] {
  const seen = new Set<string>();
  const out: ReservationZone[] = [];
  for (const lane of tableLanes) {
    const id = lane.zone?.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: getZoneLabel(id, labelsById) });
  }
  // Stable-ish: put "main" first, then by name.
  return out.sort((a, b) => {
    if (a.id === "main" && b.id !== "main") return -1;
    if (b.id === "main" && a.id !== "main") return 1;
    return a.name.localeCompare(b.name);
  });
}

