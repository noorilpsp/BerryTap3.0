/**
 * Shared core logic for building FloorMapView from locationId + optional floorplanId.
 * Used by both getFloorMapView (server page) and GET /api/floor-map/view.
 */

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions,
  tables as tablesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
} from "@/lib/db/schema/orders";
import { staff } from "@/lib/db/schema/staff";
import type { FloorMapView, FloorMapTable } from "@/lib/floor-map/floorMapView";
import { isFloorMapView } from "@/lib/floor-map/floorMapView";
import {
  getFloorPlansWithActiveTrusted,
  getConvertedTablesForFloorPlanTrusted,
} from "@/app/actions/floor-plans";
import { getTablesForFloorPlanTrusted } from "@/app/actions/tables";
import type { StoreTable } from "@/store/types";

function mapStoreStatusToFloorMap(s: StoreTable["status"]): FloorMapTable["status"] {
  if (s === "reserved" || s === "cleaning") return "free";
  if (s === "urgent" || s === "active" || s === "billing" || s === "closed") return s;
  return s === "free" ? "free" : "active";
}

function mapStoreSection(s: string | undefined): string {
  if (!s || s === "private") return "main";
  return s;
}

type TableEnrichment = {
  billTotal: number;
  waves: { type: string; status: string }[];
  serverName: string | null;
};

async function getTableLiveEnrichment(
  locationId: string,
  floorPlanId: string
): Promise<Map<string, TableEnrichment>> {
  const te0 = DEV ? performance.now() : 0;
  const [tableRows, allOpenSessions] = await Promise.all([
    db.query.tables.findMany({
      where: and(
        eq(tablesTable.locationId, locationId),
        eq(tablesTable.floorPlanId, floorPlanId)
      ),
      columns: { id: true, displayId: true, tableNumber: true },
    }),
    db
      .select({
        id: sessions.id,
        tableId: sessions.tableId,
        serverId: sessions.serverId,
      })
      .from(sessions)
      .where(and(eq(sessions.locationId, locationId), eq(sessions.status, "open"))),
  ]);
  if (DEV) devTimer("  enrichment: tables + openSessions (parallel)", te0);
  if (tableRows.length === 0) return new Map();

  const tableIds = new Set(tableRows.map((r) => r.id));
  const openSessions = allOpenSessions.filter((s) => s.tableId && tableIds.has(s.tableId));
  if (openSessions.length === 0) return new Map();

  const displayIdByTableId = new Map(
    tableRows.map((r) => {
      const numMatch = r.tableNumber?.match(/^[A-Za-z]*(\d+)$/);
      const num = numMatch ? parseInt(numMatch[1], 10) : parseInt(String(r.tableNumber), 10) || 1;
      const id = (r.displayId ?? r.tableNumber ?? "").toString().toLowerCase() || `t${num}`;
      return [r.id, id] as const;
    })
  );

  const sessionIds = openSessions.map((s) => s.id);
  const serverIds = [...new Set(openSessions.map((s) => s.serverId).filter(Boolean))] as string[];

  const te2 = DEV ? performance.now() : 0;
  const [ordersRows, staffRows] = await Promise.all([
    db
      .select({
        id: ordersTable.id,
        sessionId: ordersTable.sessionId,
        wave: ordersTable.wave,
        total: ordersTable.total,
        status: ordersTable.status,
      })
      .from(ordersTable)
      .where(
        and(inArray(ordersTable.sessionId, sessionIds), ne(ordersTable.status, "cancelled"))
      ),
    serverIds.length > 0
      ? db.query.staff.findMany({
          where: inArray(staff.id, serverIds),
          columns: { id: true, fullName: true },
        })
      : Promise.resolve([]),
  ]);
  if (DEV) devTimer("  enrichment: orders + staff (parallel)", te2);

  const orderIds = ordersRows.map((o) => o.id);
  const te3 = DEV ? performance.now() : 0;
  const orderItemsRows =
    orderIds.length > 0
      ? await db
          .select({
            orderId: orderItemsTable.orderId,
            status: orderItemsTable.status,
          })
          .from(orderItemsTable)
          .where(
            and(inArray(orderItemsTable.orderId, orderIds), sql`${orderItemsTable.voidedAt} IS NULL`)
          )
      : [];
  if (DEV) devTimer("  enrichment: orderItems query", te3);

  const te4 = DEV ? performance.now() : 0;
  const staffByName = new Map(staffRows.map((s) => [s.id, s.fullName]));
  const ordersBySession = new Map<string, typeof ordersRows>();
  for (const o of ordersRows) {
    if (o.sessionId) {
      const list = ordersBySession.get(o.sessionId) ?? [];
      list.push(o);
      ordersBySession.set(o.sessionId, list);
    }
  }
  const itemsByOrderId = new Map<string, typeof orderItemsRows>();
  for (const i of orderItemsRows) {
    const list = itemsByOrderId.get(i.orderId) ?? [];
    list.push(i);
    itemsByOrderId.set(i.orderId, list);
  }
  if (DEV) devTimer("  enrichment: JS mapping (ordersBySession, itemsByOrderId)", te4);

  const te5 = DEV ? performance.now() : 0;
  const WAVE_TYPES = ["drinks", "food", "dessert"];
  function itemStatusToWaveStatus(s: string): string {
    if (s === "served") return "served";
    if (s === "ready") return "ready";
    if (s === "preparing") return "cooking";
    return "held";
  }

  const result = new Map<string, TableEnrichment>();
  for (const sess of openSessions) {
    const tableId = sess.tableId;
    const displayId = tableId ? displayIdByTableId.get(tableId) : undefined;
    if (!displayId) continue;

    const orders = ordersBySession.get(sess.id) ?? [];
    let billTotal = 0;
    const waveItems = new Map<number, string[]>();
    for (const o of orders) {
      const totalNum = parseFloat(String(o.total ?? 0));
      if (Number.isFinite(totalNum)) billTotal += totalNum;
      const items = itemsByOrderId.get(o.id) ?? [];
      const statuses = items.map((i) => itemStatusToWaveStatus(i.status));
      const existing = waveItems.get(o.wave) ?? [];
      waveItems.set(o.wave, [...existing, ...statuses]);
    }
    const waves: { type: string; status: string }[] = [];
    const waveNumbers = [...waveItems.keys()].sort((a, b) => a - b);
    if (waveNumbers.length === 0) {
      waves.push(
        { type: "drinks", status: "not_started" },
        { type: "food", status: "not_started" },
        { type: "dessert", status: "not_started" }
      );
    } else {
      for (const wn of waveNumbers) {
        const statuses = waveItems.get(wn) ?? [];
        let status = "held";
        if (statuses.length === 0) status = "held";
        else if (statuses.every((s) => s === "served")) status = "served";
        else if (statuses.some((s) => s === "ready")) status = "ready";
        else if (statuses.some((s) => s === "cooking")) status = "cooking";
        else if (statuses.some((s) => s === "held")) status = "held";
        waves.push({
          type: WAVE_TYPES[(wn - 1) % WAVE_TYPES.length],
          status,
        });
      }
    }
    const serverName = sess.serverId ? staffByName.get(sess.serverId) ?? null : null;
    result.set(displayId, { billTotal, waves, serverName });
  }
  if (DEV) devTimer("  enrichment: result loop (waves, billTotal per session)", te5);
  return result;
}

function storeTablesToFloorMapTables(
  tables: StoreTable[],
  enrichment?: Map<string, TableEnrichment>
): FloorMapTable[] {
  return tables.map((t) => {
    const enrich = enrichment?.get(t.id);
    return {
      id: t.id,
      number: t.number,
      section: mapStoreSection(t.section),
      status: mapStoreStatusToFloorMap(t.status),
      capacity: t.capacity,
      guests: t.guests ?? 0,
      stage: (t.stage as FloorMapTable["stage"]) ?? null,
      position: t.position,
      shape: t.shape,
      serverId: t.serverId ?? null,
      serverName: enrich?.serverName ?? null,
      seatedAt: t.seatedAt ?? null,
      alerts: t.alerts ?? [],
      width: t.width,
      height: t.height,
      rotation: t.rotation,
      ...(enrich && {
        billTotal: enrich.billTotal,
        waves: enrich.waves,
      }),
    };
  });
}

const PLACEHOLDER_CURRENT_SERVER: NonNullable<FloorMapView["currentServer"]> = {
  id: "s1",
  name: "Sarah",
  section: "main",
  assignedTableIds: [],
};

async function getCurrentServerForUser(
  locationId: string,
  userId: string
): Promise<FloorMapView["currentServer"]> {
  const staffRow = await db.query.staff.findFirst({
    where: and(
      eq(staff.userId, userId),
      eq(staff.locationId, locationId),
      eq(staff.isActive, true)
    ),
    columns: { id: true, fullName: true },
  });
  if (!staffRow) return PLACEHOLDER_CURRENT_SERVER;

  const openSessions = await db
    .select({
      displayId: tablesTable.displayId,
      tableNumber: tablesTable.tableNumber,
      section: tablesTable.section,
    })
    .from(sessions)
    .innerJoin(tablesTable, eq(sessions.tableId, tablesTable.id))
    .where(
      and(
        eq(sessions.locationId, locationId),
        eq(sessions.serverId, staffRow.id),
        eq(sessions.status, "open")
      )
    );

  const assignedTableIds = openSessions
    .map((r) => (r.displayId ?? r.tableNumber ?? "").toLowerCase())
    .filter(Boolean);
  const section = openSessions[0]?.section ?? "main";

  return {
    id: staffRow.id,
    name: staffRow.fullName,
    section,
    assignedTableIds,
  };
}

/** Dev-only timing for perf diagnosis. No-op in production. */
const DEV = process.env.NODE_ENV !== "production";
function devTimer(label: string, start: number): void {
  if (!DEV) return;
  const ms = Math.round(performance.now() - start);
  // eslint-disable-next-line no-console
  console.log(`[buildFloorMapView] ${label}: ${ms}ms`);
}

/**
 * Build FloorMapView for a location. Caller must have validated auth and location access.
 * If floorplanId is null/omitted, uses the active floor plan from DB.
 */
export async function buildFloorMapView(
  locationId: string,
  userId: string,
  floorplanId?: string | null
): Promise<FloorMapView | null> {
  const totalStart = DEV ? performance.now() : 0;

  const t1 = DEV ? performance.now() : 0;
  const { allPlans, activePlan } = await getFloorPlansWithActiveTrusted(locationId);
  if (DEV) devTimer("floorplan lookup (getFloorPlansWithActiveTrusted)", t1);

  const effectiveFloorplanId = floorplanId?.trim() || activePlan?.id || null;
  let activeFloorplan = activePlan;
  if (effectiveFloorplanId && effectiveFloorplanId !== activePlan?.id) {
    activeFloorplan = allPlans.find((p) => p.id === effectiveFloorplanId) ?? null;
  }

  let storeTables: StoreTable[] = [];
  if (activeFloorplan?.id) {
    const t2 = DEV ? performance.now() : 0;
    storeTables = await getTablesForFloorPlanTrusted(locationId, activeFloorplan.id);
    if (storeTables.length === 0) {
      storeTables = await getConvertedTablesForFloorPlanTrusted(locationId, activeFloorplan.id);
    }
    if (DEV) devTimer("tables fetch (getTablesForFloorPlanTrusted / getConvertedTablesForFloorPlanTrusted)", t2);
  }

  const t3 = DEV ? performance.now() : 0;
  const [enrichment, currentServer] = await Promise.all([
    activeFloorplan?.id
      ? getTableLiveEnrichment(locationId, activeFloorplan.id)
      : Promise.resolve(undefined),
    getCurrentServerForUser(locationId, userId),
  ]);
  if (DEV) devTimer("enrichment + getCurrentServerForUser (parallel)", t3);

  const t4 = DEV ? performance.now() : 0;
  const tables = storeTablesToFloorMapTables(storeTables, enrichment);
  const statusCounts = {
    free: tables.filter((t) => t.status === "free").length,
    active: tables.filter((t) => t.status === "active").length,
    urgent: tables.filter((t) => t.status === "urgent").length,
    billing: tables.filter((t) => t.status === "billing").length,
    closed: tables.filter((t) => t.status === "closed").length,
  };
  if (DEV) devTimer("transform (storeTablesToFloorMapTables + statusCounts)", t4);

  const view: FloorMapView = {
    tables,
    sections: activeFloorplan?.sections ?? [],
    allFloorplans: allPlans.map((p) => ({ id: p.id, name: p.name })),
    floorplan: {
      id: activeFloorplan?.id ?? null,
      elements: (activeFloorplan?.elements as FloorMapView["floorplan"]["elements"]) ?? [],
      activeId: activeFloorplan?.id ?? null,
    },
    statusCounts,
    currentServer,
  };

  if (!isFloorMapView(view)) return null;
  if (DEV) devTimer("buildFloorMapView total", totalStart);
  return view;
}
