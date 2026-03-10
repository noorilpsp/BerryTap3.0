import { NextRequest } from "next/server";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions,
  tables as tablesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
} from "@/lib/db/schema/orders";
import { staff } from "@/lib/db/schema/staff";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosUserId } from "@/lib/pos/posAuth";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import type { FloorMapView, FloorMapTable } from "@/lib/floor-map/floorMapView";
import { isFloorMapView } from "@/lib/floor-map/floorMapView";
import { getFloorPlansForLocation, getActiveFloorPlan } from "@/app/actions/floor-plans";
import { getTablesForFloorPlan } from "@/app/actions/tables";
import { getConvertedTablesForFloorPlan } from "@/app/actions/floor-plans";
import type { StoreTable } from "@/store/types";
/** Map StoreTable status to FloorMapTable status */
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

/** Fetch bill total, waves, and server name for tables with open sessions. */
async function getTableLiveEnrichment(
  locationId: string,
  floorPlanId: string
): Promise<Map<string, TableEnrichment>> {
  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      eq(tablesTable.floorPlanId, floorPlanId)
    ),
    columns: { id: true, displayId: true, tableNumber: true },
  });
  if (tableRows.length === 0) return new Map();

  const tableIds = tableRows.map((r) => r.id);
  const displayIdByTableId = new Map(
    tableRows.map((r) => {
      const numMatch = r.tableNumber?.match(/^[A-Za-z]*(\d+)$/);
      const num = numMatch ? parseInt(numMatch[1], 10) : parseInt(String(r.tableNumber), 10) || 1;
      const id = (r.displayId ?? r.tableNumber ?? "").toString().toLowerCase() || `t${num}`;
      return [r.id, id] as const;
    })
  );

  const openSessions = await db
    .select({
      id: sessions.id,
      tableId: sessions.tableId,
      serverId: sessions.serverId,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.locationId, locationId),
        eq(sessions.status, "open"),
        inArray(sessions.tableId, tableIds)
      )
    );

  if (openSessions.length === 0) return new Map();

  const sessionIds = openSessions.map((s) => s.id);
  const serverIds = [...new Set(openSessions.map((s) => s.serverId).filter(Boolean))] as string[];

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

  const orderIds = ordersRows.map((o) => o.id);
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

/**
 * Placeholder when user is not staff or lookup fails.
 */
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

  const assignedTableIds = openSessions.map((r) =>
    (r.displayId ?? r.tableNumber ?? "").toLowerCase()
  ).filter(Boolean);
  const section = openSessions[0]?.section ?? "main";

  return {
    id: staffRow.id,
    name: staffRow.fullName,
    section,
    assignedTableIds,
  };
}

/**
 * GET /api/floor-map/view?locationId=<uuid>&floorplanId=<uuid>
 * Returns FloorMapView for the location. floorplanId optional; uses active if omitted.
 */
export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get("locationId");
    const floorplanIdParam = request.nextUrl.searchParams.get("floorplanId");

    if (!locationId?.trim()) {
      return posFailure("BAD_REQUEST", "locationId is required", { status: 400 });
    }

    const supabase = await supabaseServer();
    const authResult = await getPosUserId(supabase);
    if (!authResult.ok) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const ctx = await getPosMerchantContext(authResult.userId);
    if (!ctx.locationIds.length) {
      return posFailure("FORBIDDEN", "Forbidden - No locations available", { status: 403 });
    }
    if (!ctx.locationIds.includes(locationId)) {
      return posFailure(
        "FORBIDDEN",
        "Forbidden - You don't have access to this location",
        { status: 403 }
      );
    }

    const [allPlans, activePlan] = await Promise.all([
      getFloorPlansForLocation(locationId),
      getActiveFloorPlan(locationId),
    ]);

    const floorplanId = floorplanIdParam?.trim() || activePlan?.id || null;
    let activeFloorplan = activePlan;
    if (floorplanId && floorplanId !== activePlan?.id) {
      activeFloorplan = allPlans.find((p) => p.id === floorplanId) ?? null;
    }

    let storeTables: StoreTable[] = [];
    if (activeFloorplan?.id) {
      storeTables = await getTablesForFloorPlan(locationId, activeFloorplan.id);
      if (storeTables.length === 0) {
        storeTables = await getConvertedTablesForFloorPlan(locationId, activeFloorplan.id);
      }
    }

    const enrichment =
      activeFloorplan?.id
        ? await getTableLiveEnrichment(locationId, activeFloorplan.id)
        : undefined;
    const tables = storeTablesToFloorMapTables(storeTables, enrichment);
    const statusCounts = {
      free: tables.filter((t) => t.status === "free").length,
      active: tables.filter((t) => t.status === "active").length,
      urgent: tables.filter((t) => t.status === "urgent").length,
      billing: tables.filter((t) => t.status === "billing").length,
      closed: tables.filter((t) => t.status === "closed").length,
    };

    const currentServer = await getCurrentServerForUser(locationId, authResult.userId);

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

    if (!isFloorMapView(view)) {
      return posFailure("INTERNAL_ERROR", "Invalid FloorMapView payload", { status: 500 });
    }

    return posSuccess(view);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load floor map view"),
      { status: 500 }
    );
  }
}
