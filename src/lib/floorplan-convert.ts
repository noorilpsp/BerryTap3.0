import type { PlacedElement, FloorSection } from "./floorplan-types";
import type { StoreTable, StoreTableShape } from "@/store/types";

const DEFAULT_SECTIONS: FloorSection[] = [
  { id: "patio", name: "Patio" },
  { id: "bar", name: "Bar Area" },
  { id: "main", name: "Main Dining" },
];

function getTableShape(element: PlacedElement): string {
  if (element.shape === "circle" || element.shape === "ellipse") {
    return "round";
  }
  if (element.templateId?.includes("booth")) {
    return "booth";
  }
  if (element.width > element.height * 1.5) {
    return "rectangle";
  }
  return "square";
}

function assignSectionByPosition(
  x: number,
  totalWidth: number,
  sections: FloorSection[]
): string {
  if (sections.length === 0) return "main";
  const third = totalWidth / 3;
  const idx = x < third ? 0 : x < third * 2 ? 1 : 2;
  return sections[Math.min(idx, sections.length - 1)].id;
}

function toValidTableNumber(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isInteger(value)) return null;
  if (value <= 0) return null;
  return value;
}

/**
 * Convert builder elements to StoreTable[] for the central store.
 * Pure function - safe for server use.
 * @param elements - Placed elements from the builder
 * @param sections - Floor plan sections; falls back to default (patio, bar, main) if not provided
 * @param usedTableNumbers - Optional set of table numbers already used (e.g. by other floor plans). New tables will be assigned numbers starting after the max.
 */
export function convertElementsToStoreTables(
  elements: PlacedElement[],
  sections: FloorSection[] = DEFAULT_SECTIONS,
  usedTableNumbers?: Iterable<number>
): StoreTable[] {
  const tableElements = elements.filter(
    (el) =>
      (el.category === "tables" || el.category === "seating") &&
      (el.seats ?? 0) > 0
  );
  if (tableElements.length === 0) return [];

  const maxX = Math.max(...tableElements.map((el) => el.x), 1000);

  // Preserve explicit table numbers when present; fill gaps for missing/duplicate values.
  const usedNumbers = new Set<number>(usedTableNumbers ?? []);
  const resolvedNumbers = new Map<string, number>();
  for (const el of tableElements) {
    const explicit = toValidTableNumber(el.tableNumber);
    if (explicit && !usedNumbers.has(explicit)) {
      usedNumbers.add(explicit);
      resolvedNumbers.set(el.id, explicit);
    }
  }
  let nextAvailable = 1;
  for (const el of tableElements) {
    if (resolvedNumbers.has(el.id)) continue;
    while (usedNumbers.has(nextAvailable)) nextAvailable += 1;
    resolvedNumbers.set(el.id, nextAvailable);
    usedNumbers.add(nextAvailable);
    nextAvailable += 1;
  }

  const validSectionIds = new Set(sections.map((s) => s.id));

  return tableElements.map((el) => {
    const tableNumber = resolvedNumbers.get(el.id) ?? 1;
    const section =
      el.sectionId && validSectionIds.has(el.sectionId)
        ? el.sectionId
        : assignSectionByPosition(el.x, maxX, sections);
    const capacity = el.seats ?? 4;
    const shape = getTableShape(el) as StoreTableShape;
    return {
      id: `t${tableNumber}`,
      number: tableNumber,
      section,
      capacity,
      status: "free" as const,
      shape,
      position: { x: el.x, y: el.y },
      width: el.width,
      height: el.height,
      rotation: el.rotation,
    };
  });
}

/**
 * Get the table number that would be assigned to an element when saving.
 * Use in the builder inspector when element.tableNumber is unset (auto).
 */
export function getAssignedTableNumberForElement(
  elementId: string,
  elements: PlacedElement[],
  sections: FloorSection[] = DEFAULT_SECTIONS,
  usedTableNumbers?: Iterable<number>
): number | null {
  const storeTables = convertElementsToStoreTables(
    elements,
    sections,
    usedTableNumbers
  );
  const tableElements = elements.filter(
    (el) =>
      (el.category === "tables" || el.category === "seating") &&
      (el.seats ?? 0) > 0
  );
  const idx = tableElements.findIndex((el) => el.id === elementId);
  if (idx < 0 || idx >= storeTables.length) return null;
  return storeTables[idx].number;
}
