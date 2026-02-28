"use server";

import { eq, and, inArray, ne, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { floorPlans } from "@/lib/db/schema/floor-plans";
import { tables, orders, reservations } from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { PlacedElement, FloorSection } from "@/lib/floorplan-types";
import { convertElementsToStoreTables } from "@/lib/floorplan-convert";
import type { StoreTable } from "@/store/types";

export interface FloorPlanResult {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  canvas: { gridSize: number };
  elements: PlacedElement[];
  sections?: FloorSection[];
  totalSeats: number;
}

/**
 * Get all floor plans for a location
 */
export async function getFloorPlansForLocation(
  locationId: string
): Promise<FloorPlanResult[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const rows = await db.query.floorPlans.findMany({
    where: eq(floorPlans.locationId, locationId),
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    version: 1,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    canvas: { gridSize: r.gridSize },
    elements: (r.elements as PlacedElement[]) ?? [],
    sections: (r.sections as FloorSection[] | null) ?? undefined,
    totalSeats: r.totalSeats,
  }));
}

/**
 * Get converted StoreTables for a floor plan, with table numbers unique across all floor plans.
 */
export async function getConvertedTablesForFloorPlan(
  locationId: string,
  floorPlanId: string
): Promise<StoreTable[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const row = await db.query.floorPlans.findFirst({
    where: and(
      eq(floorPlans.id, floorPlanId),
      eq(floorPlans.locationId, locationId)
    ),
  });
  if (!row || !row.elements) return [];

  const allPlans = await db.query.floorPlans.findMany({
    where: eq(floorPlans.locationId, locationId),
    columns: { id: true, elements: true },
    orderBy: (fp, { asc }) => [asc(fp.createdAt), asc(fp.id)],
  });
  const usedTableNumbers = getUsedTableNumbersExcludingPlan(allPlans, floorPlanId);

  return convertElementsToStoreTables(
    row.elements as PlacedElement[],
    (row.sections as FloorSection[] | null) ?? undefined,
    usedTableNumbers
  );
}

/**
 * Get table numbers already used by other floor plans and in the DB.
 * Use in the builder to show correct T1, T2, T3... when editing Plan 2, etc.
 */
export async function getUsedTableNumbersForPlan(
  locationId: string,
  floorPlanId: string | null
): Promise<number[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const used = new Set<number>();

  const existingDbTables = await db.query.tables.findMany({
    where: eq(tables.locationId, locationId),
    columns: { tableNumber: true, floorPlanId: true },
  });
  for (const row of existingDbTables) {
    if (floorPlanId != null && row.floorPlanId === floorPlanId) continue;
    const n = parseTableNumberFromDisplay(row.tableNumber);
    if (n != null) used.add(n);
  }

  const allPlans = await db.query.floorPlans.findMany({
    where: eq(floorPlans.locationId, locationId),
    columns: { id: true, elements: true },
    orderBy: (fp, { asc }) => [asc(fp.createdAt), asc(fp.id)],
  });
  const excludePlanId = floorPlanId ?? "__new_plan__";
  const fromOtherPlans = getUsedTableNumbersExcludingPlan(allPlans, excludePlanId);
  fromOtherPlans.forEach((n) => used.add(n));

  return Array.from(used);
}

/**
 * Get the active floor plan for a location
 */
export async function getActiveFloorPlan(
  locationId: string
): Promise<FloorPlanResult | null> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const row = await db.query.floorPlans.findFirst({
    where: and(
      eq(floorPlans.locationId, locationId),
      eq(floorPlans.isActive, true)
    ),
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    version: 1,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    canvas: { gridSize: row.gridSize },
    elements: (row.elements as PlacedElement[]) ?? [],
    sections: (row.sections as FloorSection[] | null) ?? undefined,
    totalSeats: row.totalSeats,
  };
}

/**
 * Save a floor plan (insert or update). If isActive, sync tables.
 */
export async function saveFloorPlan(
  locationId: string,
  data: {
    name: string;
    elements: PlacedElement[];
    sections?: FloorSection[];
    gridSize: number;
    totalSeats: number;
    isActive?: boolean;
    existingId?: string;
  }
): Promise<{ id: string; tables: StoreTable[] }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const now = new Date();

  if (data.existingId) {
    await db
      .update(floorPlans)
      .set({
        name: data.name,
        elements: data.elements as unknown as typeof floorPlans.$inferInsert.elements,
        sections: data.sections ?? null,
        gridSize: data.gridSize,
        totalSeats: data.totalSeats,
        isActive: data.isActive ?? false,
        updatedAt: now,
      })
      .where(
        and(
          eq(floorPlans.id, data.existingId),
          eq(floorPlans.locationId, locationId)
        )
      );
    const tables = data.isActive
      ? await syncTablesFromElements(locationId, data.existingId, data.elements, data.sections)
      : [];
    return { id: data.existingId, tables };
  }

  const [inserted] = await db
    .insert(floorPlans)
    .values({
      locationId,
      name: data.name,
      elements: data.elements as unknown as typeof floorPlans.$inferInsert.elements,
      sections: data.sections ?? null,
      gridSize: data.gridSize,
      totalSeats: data.totalSeats,
      isActive: data.isActive ?? false,
    })
    .returning({ id: floorPlans.id });

  if (!inserted) throw new Error("Failed to save floor plan");
  const tables = data.isActive
    ? await syncTablesFromElements(locationId, inserted.id, data.elements, data.sections)
    : [];
  return { id: inserted.id, tables };
}

/**
 * Set active floor plan and optionally sync tables.
 */
export async function setActiveFloorPlanId(
  locationId: string,
  floorPlanId: string | null
): Promise<void> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  await db
    .update(floorPlans)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(floorPlans.locationId, locationId));

  if (floorPlanId) {
    await db
      .update(floorPlans)
      .set({ isActive: true, updatedAt: new Date() })
      .where(
        and(
          eq(floorPlans.id, floorPlanId),
          eq(floorPlans.locationId, locationId)
        )
      );
    // Do NOT sync tables here. Table numbers are set once when saving in the builder.
    // Switching plans should only update isActive; tables are loaded from DB via getTablesForFloorPlan.
  }
}

/**
 * Delete a floor plan.
 */
export async function deleteFloorPlan(
  locationId: string,
  floorPlanId: string
): Promise<void> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const row = await db.query.floorPlans.findFirst({
    where: and(
      eq(floorPlans.id, floorPlanId),
      eq(floorPlans.locationId, locationId)
    ),
  });
  if (!row) {
    throw new Error("Floor plan not found");
  }

  // Unlink orders and reservations from tables that will be cascade-deleted.
  // (orders/reservations lack ON DELETE, so we must null tableId before the cascade.)
  const planTables = await db.query.tables.findMany({
    where: and(
      eq(tables.locationId, locationId),
      or(eq(tables.floorPlanId, floorPlanId), isNull(tables.floorPlanId))
    ),
    columns: { id: true },
  });
  const tableIds = planTables.map((t) => t.id);
  if (tableIds.length > 0) {
    await db.update(orders).set({ tableId: null }).where(inArray(orders.tableId, tableIds));
    await db.update(reservations).set({ tableId: null }).where(inArray(reservations.tableId, tableIds));
  }

  await db
    .delete(floorPlans)
    .where(
      and(
        eq(floorPlans.id, floorPlanId),
        eq(floorPlans.locationId, locationId)
      )
    );
}

function getUsedTableNumbersExcludingPlan(
  allPlans: { id: string; elements: unknown }[],
  excludePlanId: string
): Set<number> {
  // Assign each plan a block based on its position in the global order (createdAt).
  // Plan 1 (first) → 1,2; Plan 2 (second) → 3,4; Plan 3 → 5,6. Current plan gets
  // its own block; we return the union of blocks for all OTHER plans.
  const used = new Set<number>();
  let next = 1;
  for (const plan of allPlans) {
    const tableEls = ((plan.elements as PlacedElement[]) ?? []).filter(
      (el) =>
        (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
    );
    const blockStart = next;
    next += tableEls.length;
    if (plan.id === excludePlanId) continue;
    for (let i = 0; i < tableEls.length; i++) {
      used.add(blockStart + i);
    }
  }
  return used;
}

function parseTableNumberFromDisplay(s: string): number | null {
  const m = s.match(/^[A-Za-z]*(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

async function syncTablesFromElements(
  locationId: string,
  floorPlanId: string,
  elements: PlacedElement[],
  sections?: FloorSection[]
): Promise<ReturnType<typeof convertElementsToStoreTables>> {
  // Used numbers: from other floor plans + existing tables in DB (check for duplicates)
  const usedTableNumbers = new Set<number>();

  const existingDbTables = await db.query.tables.findMany({
    where: eq(tables.locationId, locationId),
    columns: { tableNumber: true, floorPlanId: true },
  });
  for (const row of existingDbTables) {
    const n = parseTableNumberFromDisplay(row.tableNumber);
    if (n != null) usedTableNumbers.add(n);
  }

  const allPlans = await db.query.floorPlans.findMany({
    where: eq(floorPlans.locationId, locationId),
    columns: { id: true, elements: true },
    orderBy: (fp, { asc }) => [asc(fp.createdAt), asc(fp.id)],
  });
  const fromOtherPlans = getUsedTableNumbersExcludingPlan(allPlans, floorPlanId);
  fromOtherPlans.forEach((n) => usedTableNumbers.add(n));

  const storeTables = convertElementsToStoreTables(elements, sections, usedTableNumbers);

  // Delete only this floor plan's tables (+ legacy null floorPlanId as one-time migration)
  const planTables = await db.query.tables.findMany({
    where: and(
      eq(tables.locationId, locationId),
      or(eq(tables.floorPlanId, floorPlanId), isNull(tables.floorPlanId))
    ),
    columns: { id: true, floorPlanId: true },
  });
  const toDelete = planTables.filter((t) => t.floorPlanId === floorPlanId || t.floorPlanId === null);
  const tableIds = toDelete.map((t) => t.id);
  if (tableIds.length > 0) {
    await db.update(orders).set({ tableId: null }).where(inArray(orders.tableId, tableIds));
    await db.update(reservations).set({ tableId: null }).where(inArray(reservations.tableId, tableIds));
    await db.delete(tables).where(
      and(
        eq(tables.locationId, locationId),
        or(eq(tables.floorPlanId, floorPlanId), isNull(tables.floorPlanId))
      )
    );
  }

  if (storeTables.length > 0) {
    await db.insert(tables).values(
      storeTables.map((t) => ({
        locationId,
        floorPlanId,
        displayId: `T${t.number}`,
        tableNumber: `T${t.number}`,
        seats: t.capacity,
        status: t.status === "free" ? "available" : "occupied",
        section: t.section,
        shape: t.shape,
        position: t.position,
        width: t.width ?? null,
        height: t.height ?? null,
        rotation: t.rotation ?? null,
      }))
    );
  }
  return storeTables;
}
