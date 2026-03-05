import { NextRequest } from "next/server";
import { and, asc, eq, inArray, ilike, ne, sql } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { tables, sessions, seats, orders, orderItems } from "@/lib/db/schema/orders";
import { getSessionOutstandingItems } from "@/app/actions/session-close-validation";
import { checkKitchenDelays } from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import { isTableView, type TableView, type TableViewUiMode, type TableViewServiceStage } from "@/lib/pos/tableView";
import { normalizeFurnitureStatus, type FurnitureStatus } from "@/lib/pos/tableStatus";

export const runtime = "nodejs";

const DEV = process.env.NODE_ENV !== "production";

function devTimer(label: string, start: number, rowCount?: number): void {
  if (!DEV) return
  const ms = Math.round(performance.now() - start)
  const rowPart = rowCount !== undefined ? ` rows=${rowCount}` : ""
  // eslint-disable-next-line no-console
  console.log(`[pos] ${label} ${ms}ms${rowPart}`)
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(s: string): boolean {
  return UUID_REGEX.test(s);
}

type PosItemStatus = "held" | "sent" | "cooking" | "ready" | "served" | "void";
type PosWaveStatus = "held" | "sent" | "preparing" | "ready" | "served";

function tableNumberToInt(value: string | null | undefined): number {
  if (!value) return 0;
  const match = value.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) || 0 : 0;
}

function mapItemStatus(
  item: { status: string; voidedAt: Date | null },
  waveFiredAt: Date | null
): PosItemStatus {
  if (item.voidedAt) return "void";
  if (item.status === "served") return "served";
  if (item.status === "ready") return "ready";
  if (item.status === "preparing") return "cooking";
  if (item.status === "pending") return waveFiredAt ? "sent" : "held";
  return waveFiredAt ? "sent" : "held";
}

function mapWaveStatus(
  items: Array<{ status: PosItemStatus }>,
  firedAt: Date | null
): PosWaveStatus {
  const active = items.filter((i) => i.status !== "void");
  if (active.length === 0) return "held";
  if (active.every((i) => i.status === "served")) return "served";
  if (active.some((i) => i.status === "ready")) return "ready";
  if (active.some((i) => i.status === "cooking")) return "preparing";
  if (firedAt) return "sent";
  return "held";
}

const FURNITURE_BLOCKED = new Set<FurnitureStatus>(["maintenance", "disabled"]);
function computeUiMode(furnitureStatus: FurnitureStatus, hasSession: boolean): TableViewUiMode {
  if (FURNITURE_BLOCKED.has(furnitureStatus)) return "blocked";
  if (hasSession) return "in_service";
  return "needs_seating";
}

type ItemWithStatus = { status: string };
function computeServiceStage(
  uiMode: TableViewUiMode,
  items: ItemWithStatus[],
  tableStage: string | null
): TableViewServiceStage {
  if (uiMode === "blocked") return "needs_attention";
  if (uiMode === "needs_seating") return "available";

  const active = items.filter((i) => i.status !== "void");
  if (active.length === 0) return "seated";

  if (tableStage === "bill") return "bill_requested";
  if (active.some((i) => i.status === "ready")) return "food_ready";
  if (active.some((i) => i.status === "cooking" || i.status === "sent")) return "in_kitchen";
  if (active.some((i) => i.status === "held")) return "ordering";
  if (active.every((i) => i.status === "served")) return "served";

  return "ordering";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const totalStart = DEV ? performance.now() : 0
  try {
    const { id } = await params
    const explainParam = request.nextUrl.searchParams.get("explain")
    const explainMode = DEV && explainParam === "1"
    const explainOutstanding = DEV && explainParam === "outstanding"
    const explainDelays = DEV && explainParam === "delays"
    const debugIndexes = DEV && request.nextUrl.searchParams.get("debug_indexes") === "1"

    const supabase = await supabaseServer()
    const t0 = DEV ? performance.now() : 0
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (DEV) devTimer("auth.getUser", t0)
    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const t1 = DEV ? performance.now() : 0
    const memberships = await db.query.merchantUsers.findMany({
      where: and(
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { merchantId: true },
    })
    if (DEV) devTimer("merchantUsers.findMany", t1, memberships.length)
    const merchantIds = [...new Set(memberships.map((m) => m.merchantId))];
    if (merchantIds.length === 0) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to any location", { status: 403 });
    }

    const t2 = DEV ? performance.now() : 0
    const locations = await db.query.merchantLocations.findMany({
      where: inArray(merchantLocations.merchantId, merchantIds),
      columns: { id: true },
    })
    if (DEV) devTimer("merchantLocations.findMany", t2, locations.length)
    const locationIds = locations.map((l) => l.id);
    if (locationIds.length === 0) {
      return posFailure("FORBIDDEN", "Forbidden - No locations available", { status: 403 });
    }

    const t3 = DEV ? performance.now() : 0
    const table = isValidUuid(id)
      ? await db.query.tables.findFirst({
          where: and(eq(tables.id, id), inArray(tables.locationId, locationIds)),
          columns: {
            id: true,
            locationId: true,
            tableNumber: true,
            displayId: true,
            status: true,
            section: true,
            shape: true,
            seats: true,
            guests: true,
            seatedAt: true,
            stage: true,
            alerts: true,
          },
          with: {
            location: { columns: { merchantId: true } },
          },
        })
      : await db.query.tables.findFirst({
          where: and(
            inArray(tables.locationId, locationIds),
            ilike(tables.displayId, id)
          ),
          columns: {
            id: true,
            locationId: true,
            tableNumber: true,
            displayId: true,
            status: true,
            section: true,
            shape: true,
            seats: true,
            guests: true,
            seatedAt: true,
            stage: true,
            alerts: true,
          },
          with: {
            location: { columns: { merchantId: true } },
          },
        })
    if (DEV) devTimer("tables.findFirst", t3, table ? 1 : 0)

    if (!table?.location) {
      return posFailure("NOT_FOUND", "Table not found", { status: 404 });
    }

    const t4 = DEV ? performance.now() : 0
    const openSession = await db.query.sessions.findFirst({
      where: and(eq(sessions.tableId, table.id), eq(sessions.status, "open")),
      columns: {
        id: true,
        guestCount: true,
        openedAt: true,
        status: true,
      },
      orderBy: (s, { desc }) => [desc(s.openedAt)],
    })
    if (DEV) devTimer("sessions.findFirst", t4, openSession ? 1 : 0)

    const sessionId = openSession?.id ?? null

    const t5 = DEV ? performance.now() : 0
    const [seatRows, orderRows] = sessionId
      ? await Promise.all([
          db.query.seats.findMany({
            where: and(eq(seats.sessionId, sessionId), eq(seats.status, "active")),
            columns: {
              id: true,
              seatNumber: true,
              guestName: true,
            },
            orderBy: (s, { asc }) => [asc(s.seatNumber)],
          }),
          db.query.orders.findMany({
            where: eq(orders.sessionId, sessionId),
            columns: {
              id: true,
              wave: true,
              firedAt: true,
              status: true,
            },
            orderBy: (o, { asc }) => [asc(o.wave)],
          }),
        ])
      : [[], []]
    if (DEV) devTimer("[pos] parallel block 1 (seats+orders)", t5)
    if (DEV) devTimer("seats.findMany", t5, seatRows.length)
    if (DEV) devTimer("orders.findMany", t5, orderRows.length)
    const orderById = new Map(orderRows.map((o) => [o.id, o]));
    const waveOrderByNumber = new Map(orderRows.map((o) => [o.wave, o]));

    const orderIds = orderRows.map((o) => o.id)
    const t7 = DEV ? performance.now() : 0
    const itemRows = orderRows.length
      ? await db.query.orderItems.findMany({
          where: inArray(orderItems.orderId, orderIds),
          columns: {
            id: true,
            orderId: true,
            itemId: true,
            itemName: true,
            itemPrice: true,
            quantity: true,
            seat: true,
            seatId: true,
            notes: true,
            status: true,
            sentToKitchenAt: true,
            startedAt: true,
            readyAt: true,
            servedAt: true,
            voidedAt: true,
          },
          orderBy: (i, { asc }) => [asc(i.createdAt)],
        })
      : []
    if (DEV) devTimer("orderItems.findMany", t7, itemRows.length)

    const orderItemsExplainSql = `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) ORDER BY created_at ASC`
    if (DEV) {
      // eslint-disable-next-line no-console
      console.log("[pos] orderItems query (heaviest):", {
        sql: orderItemsExplainSql,
        params: [orderIds],
      })
    }

    let explainResult: string | undefined
    if (orderIds.length > 0) {
      const runExplainQuery = async (baseSql: string, params: unknown[]) => {
        const explainFullSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${baseSql}`
        const { neon } = await import("@neondatabase/serverless")
        const client = neon(process.env.DATABASE_URL!)
        const rows = (await client.query(explainFullSql, params)) as { "QUERY PLAN"?: string }[]
        return Array.isArray(rows)
          ? rows.map((r) => r["QUERY PLAN"] ?? String(r)).join("\n")
          : String(rows)
      }
      if (explainMode) {
        try {
          explainResult = await runExplainQuery(orderItemsExplainSql, [orderIds])
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`
        }
      }
      if (explainOutstanding) {
        try {
          const sql =
            "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND voided_at IS NULL"
          explainResult = await runExplainQuery(sql, [orderIds])
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`
        }
      }
      if (explainDelays) {
        try {
          const sql =
            "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL"
          explainResult = await runExplainQuery(sql, [orderIds])
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`
        }
      }
    }

    const seatNumberBySeatId = new Map(
      seatRows.map((s) => [s.id, s.seatNumber])
    );

    const items = itemRows.map((row) => {
      const order = orderById.get(row.orderId);
      const waveNumber = order?.wave ?? 1;
      const seatNumber =
        row.seatId && seatNumberBySeatId.has(row.seatId)
          ? seatNumberBySeatId.get(row.seatId)!
          : row.seat ?? 0;
      const mappedStatus = mapItemStatus(
        { status: row.status, voidedAt: row.voidedAt ?? null },
        order?.firedAt ?? null
      );
      return {
        id: row.id,
        orderId: row.orderId,
        menuItemId: row.itemId,
        name: row.itemName,
        price: Number(row.itemPrice),
        quantity: row.quantity ?? 1,
        status: mappedStatus,
        seatNumber,
        waveNumber,
        notes: row.notes,
      };
    });

    const wavesByNumber = new Map<number, typeof items>();
    for (const item of items) {
      const list = wavesByNumber.get(item.waveNumber) ?? [];
      list.push(item);
      wavesByNumber.set(item.waveNumber, list);
    }
    const persistedWaveNumbers = new Set(orderRows.map((o) => o.wave));
    const itemWaveNumbers = new Set(items.map((i) => i.waveNumber));
    const includedWaveNumbers = Array.from(
      new Set([...persistedWaveNumbers, ...itemWaveNumbers])
    ).sort((a, b) => a - b);
    const waveCount = includedWaveNumbers.length;
    const waves = includedWaveNumbers.map((waveNumber) => {
      const waveOrder = waveOrderByNumber.get(waveNumber) ?? null;
      const waveItems = wavesByNumber.get(waveNumber) ?? [];
      const activeItems = waveItems.filter((i) => i.status !== "void");
      const canFire = activeItems.length > 0 && activeItems.every((i) => i.status === "held");
      const canAdvanceToPreparing = activeItems.some((i) => i.status === "sent");
      const canAdvanceToReady = activeItems.some((i) => i.status === "cooking");
      const canAdvanceToServed = activeItems.some(
        (i) => i.status === "sent" || i.status === "cooking" || i.status === "ready"
      );
      return {
        waveNumber,
        status: mapWaveStatus(
          waveItems.map((i) => ({ status: i.status })),
          waveOrder?.firedAt ?? null
        ),
        itemCount: activeItems.length,
        canFire,
        canAdvanceToPreparing,
        canAdvanceToReady,
        canAdvanceToServed,
      };
    });

    const t8 = DEV ? performance.now() : 0
    const [billRow, outstanding, delays] = sessionId
      ? await Promise.all([
          db
            .select({
              subtotal: sql<string>`COALESCE(SUM(${orders.subtotal}), 0)::numeric`,
              tax: sql<string>`COALESCE(SUM(${orders.taxAmount}), 0)::numeric`,
              total: sql<string>`COALESCE(SUM(${orders.total}), 0)::numeric`,
            })
            .from(orders)
            .where(
              and(
                eq(orders.sessionId, sessionId),
                ne(orders.status, "cancelled")
              )
            )
            .then((rows) => rows[0] ?? { subtotal: "0", tax: "0", total: "0" }),
          getSessionOutstandingItems(sessionId),
          checkKitchenDelays(sessionId, { recordEvents: false }),
        ])
      : [{ subtotal: "0", tax: "0", total: "0" }, null, null]
    if (DEV) devTimer("[pos] parallel block 2 (bill+outstanding+delays)", t8)
    if (DEV) devTimer("bill select", t8, billRow ? 1 : 0)
    if (DEV) devTimer("getSessionOutstandingItems", t8, outstanding ? 1 : 0)
    if (DEV) devTimer("checkKitchenDelays", t8, Array.isArray(delays) ? delays.length : 0)

    const canSend = items.some((item) => item.status === "held");
    const canAddWave = sessionId != null;
    const lastWave = waves.length > 0 ? waves[waves.length - 1] : null;
    const canDeleteWave =
      sessionId != null && lastWave != null && lastWave.itemCount === 0;
    const canCloseSession = sessionId != null ? Boolean(outstanding?.canClose) : false;

    const furnitureStatus = normalizeFurnitureStatus(table.status ?? "");

    const tableView: TableView = {
      table: {
        id: table.id,
        locationId: table.locationId,
        number: tableNumberToInt(table.tableNumber || table.displayId),
        displayId: table.displayId ?? table.tableNumber,
        status: furnitureStatus,
        section: table.section ?? "main",
        shape: table.shape ?? "round",
        capacity: Math.max(1, table.seats ?? seatRows.length ?? 1),
        guests: table.guests ?? openSession?.guestCount ?? 0,
        seatedAt: table.seatedAt?.toISOString() ?? null,
        stage: table.stage ?? null,
        alerts: Array.isArray(table.alerts) ? table.alerts : null,
      },
      openSession: openSession
        ? {
            id: openSession.id,
            status: openSession.status,
            guestCount: openSession.guestCount,
            openedAt: openSession.openedAt.toISOString(),
            waveCount,
          }
        : null,
      seats: seatRows.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        guestName: s.guestName,
      })),
      items,
      waves,
      actions: {
        canSend,
        canAddWave,
        canDeleteWave,
        canCloseSession,
      },
      bill: {
        subtotal: Number(billRow?.subtotal ?? 0),
        tax: Number(billRow?.tax ?? 0),
        total: Number(billRow?.total ?? 0),
      },
      outstanding,
      delays,
      uiMode: computeUiMode(furnitureStatus, openSession != null),
      serviceStage: computeServiceStage(
        computeUiMode(furnitureStatus, openSession != null),
        items,
        table.stage ?? null
      ),
    };

    if (!isTableView(tableView)) {
      return posFailure("INTERNAL_ERROR", "Invalid TableView payload", { status: 500 });
    }

    if (DEV) devTimer("GET /pos total", totalStart)

    let meta: { explain?: string; indexes?: { indexname: string; indexdef: string }[] } | undefined
    if (explainResult !== undefined) meta = { explain: explainResult }
    if (debugIndexes) {
      try {
        const { neon } = await import("@neondatabase/serverless")
        const client = neon(process.env.DATABASE_URL!)
        await client.query("ANALYZE order_items;")
        await client.query("ANALYZE orders;")
        await client.query("ANALYZE seats;")
        if (DEV) {
          // eslint-disable-next-line no-console
          console.log("[pos] ANALYZE order_items, orders, seats completed")
        }
        const indexRows = (await client.query(
          "SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ($1, $2, $3) ORDER BY tablename, indexname",
          ["order_items", "orders", "seats"]
        )) as { indexname: string; indexdef: string }[]
        meta = { ...meta, indexes: Array.isArray(indexRows) ? indexRows : [] }
      } catch (err) {
        meta = { ...meta, indexes: [] }
      }
    }

    if (meta !== undefined) {
      return new Response(
        JSON.stringify({
          ok: true,
        data: tableView,
          meta,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return posSuccess<TableView>(tableView);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load table POS view"),
      { status: 500 }
    );
  }
}
