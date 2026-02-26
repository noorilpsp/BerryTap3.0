"use server";

import { eq, and, desc, ilike } from "drizzle-orm";
import { db } from "@/db";
import { tables as tablesTable, sessions as sessionsTable } from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { StoreTable } from "@/store/types";

/**
 * Map DB table row to StoreTable
 */
function mapTableRowToStoreTable(row: {
  id: string;
  displayId: string | null;
  tableNumber: string;
  seats: number | null;
  status: string;
  section: string | null;
  shape: string | null;
  position: unknown;
  width: number | null;
  height: number | null;
  rotation: number | null;
  guests: number | null;
  serverId: string | null;
  seatedAt: Date | null;
  stage: string | null;
  alerts: unknown;
}): StoreTable {
  const pos = row.position as { x?: number; y?: number } | null;
  const alerts = row.alerts as string[] | null;
  // Parse "T1", "T2" or "1", "2" format
  const numMatch = row.tableNumber.match(/^[A-Za-z]*(\d+)$/);
  const num = numMatch ? parseInt(numMatch[1], 10) : parseInt(row.tableNumber, 10) || 1;
  const id = (row.displayId ?? row.tableNumber).toLowerCase() || `t${num}`;

  return {
    id,
    number: num,
    section: (row.section as StoreTable["section"]) ?? "main",
    capacity: row.seats ?? 4,
    status: mapDbStatusToStoreStatus(row.status),
    shape: (row.shape as StoreTable["shape"]) ?? "square",
    position: pos && typeof pos.x === "number" && typeof pos.y === "number"
      ? { x: pos.x, y: pos.y }
      : { x: 0, y: 0 },
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    rotation: row.rotation ?? undefined,
    guests: row.guests ?? undefined,
    serverId: row.serverId ?? undefined,
    seatedAt: row.seatedAt ? row.seatedAt.toISOString() : undefined,
    stage: (row.stage as StoreTable["stage"]) ?? undefined,
    alerts: alerts && Array.isArray(alerts) ? (alerts as StoreTable["alerts"]) : undefined,
  };
}

function mapDbStatusToStoreStatus(
  dbStatus: string
): StoreTable["status"] {
  const map: Record<string, StoreTable["status"]> = {
    available: "free",
    occupied: "active",
    reserved: "reserved",
    unavailable: "closed",
  };
  return map[dbStatus] ?? "free";
}

function mapStoreStatusToDb(
  status: StoreTable["status"]
): "available" | "occupied" | "reserved" | "unavailable" {
  const map: Record<StoreTable["status"], "available" | "occupied" | "reserved" | "unavailable"> = {
    free: "available",
    active: "occupied",
    urgent: "occupied",
    billing: "occupied",
    closed: "available",
    reserved: "reserved",
    cleaning: "unavailable",
  };
  return map[status] ?? "available";
}

/** Table status is derived from sessions: if an open session exists for a table, status is occupied. */
async function getTableIdsWithOpenSession(locationId: string): Promise<Set<string>> {
  const openSessions = await db.query.sessions.findMany({
    where: and(
      eq(sessionsTable.locationId, locationId),
      eq(sessionsTable.status, "open")
    ),
    columns: { tableId: true },
  });
  return new Set(openSessions.map((s) => s.tableId));
}

export async function getTablesForLocation(
  locationId: string
): Promise<StoreTable[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const [rows, openTableIds] = await Promise.all([
    db.query.tables.findMany({
      where: eq(tablesTable.locationId, locationId),
      orderBy: [desc(tablesTable.createdAt)],
    }),
    getTableIdsWithOpenSession(locationId),
  ]);

  return rows.map((r) => {
    const status = openTableIds.has(r.id) ? "occupied" : r.status;
    return mapTableRowToStoreTable({
      ...r,
      status,
      position: r.position,
      alerts: r.alerts,
    });
  });
}

/** Get tables for a specific floor plan from DB. Status derived from open sessions. */
export async function getTablesForFloorPlan(
  locationId: string,
  floorPlanId: string
): Promise<StoreTable[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const [rows, openTableIds] = await Promise.all([
    db.query.tables.findMany({
      where: and(
        eq(tablesTable.locationId, locationId),
        eq(tablesTable.floorPlanId, floorPlanId)
      ),
      orderBy: [desc(tablesTable.createdAt)],
    }),
    getTableIdsWithOpenSession(locationId),
  ]);

  return rows.map((r) => {
    const status = openTableIds.has(r.id) ? "occupied" : r.status;
    return mapTableRowToStoreTable({
      ...r,
      status,
      position: r.position,
      alerts: r.alerts,
    });
  });
}

/** Update table status, guests, seatedAt, stage, alerts in DB. These are denormalized from session for quick reads; canonical state is in sessions. */
export async function updateTable(
  locationId: string,
  tableId: string,
  patch: {
    status?: StoreTable["status"];
    guests?: number;
    seatedAt?: string | null;
    stage?: StoreTable["stage"] | null;
    alerts?: StoreTable["alerts"];
  }
): Promise<{ ok: boolean; error?: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    return { ok: false, error: "Unauthorized or location not found" };
  }

  const rows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true },
    limit: 1,
  });
  const row = rows[0];
  if (!row) {
    return { ok: false, error: "Table not found" };
  }

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (patch.status !== undefined) {
    updatePayload.status = mapStoreStatusToDb(patch.status);
  }
  if (patch.guests !== undefined) {
    updatePayload.guests = patch.guests;
  }
  if (patch.seatedAt !== undefined) {
    updatePayload.seatedAt = patch.seatedAt ? new Date(patch.seatedAt) : null;
  }
  if (patch.stage !== undefined) {
    updatePayload.stage = patch.stage;
  }
  if (patch.alerts !== undefined) {
    updatePayload.alerts = patch.alerts;
  }

  await db
    .update(tablesTable)
    .set(updatePayload as typeof tablesTable.$inferInsert)
    .where(eq(tablesTable.id, row.id));

  return { ok: true };
}
