/**
 * Table identity: UUID is the real identity. Display numbers (T12, table.number) are UI-only.
 * Centralizes resolution from display number/string to table UUID.
 */

import type { StoreTable } from "@/store/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true if string is a valid UUID. */
export function isValidUuid(s: string): boolean {
  return UUID_REGEX.test(s.trim());
}

/**
 * Resolve table UUID from store tables.
 * Input can be: UUID, display id (T12, t12), or numeric string (12).
 * Returns table UUID or null if not found.
 */
export function resolveTableUuidFromStore(
  tables: StoreTable[],
  tableIdOrDisplay: string
): string | null {
  const s = String(tableIdOrDisplay || "").trim();
  if (!s) return null;

  if (isValidUuid(s)) {
    const found = tables.find((t) => t.id.toLowerCase() === s.toLowerCase());
    return found?.id ?? null;
  }

  const numMatch = s.replace(/^t/i, "").match(/^(\d+)$/i);
  const num = numMatch ? parseInt(numMatch[1], 10) : NaN;
  if (Number.isFinite(num)) {
    const found = tables.find((t) => t.number === num);
    return found?.id ?? null;
  }

  const displayNorm = s.toLowerCase();
  const found = tables.find(
    (t) =>
      t.id.toLowerCase() === displayNorm ||
      `t${t.number}` === displayNorm ||
      `t${String(t.number).padStart(2, "0")}` === displayNorm
  );
  return found?.id ?? null;
}

/** Get display label for a table (UI only). */
export function getTableDisplayLabel(table: { number: number } | null): string {
  return table ? `T${table.number}` : "";
}
