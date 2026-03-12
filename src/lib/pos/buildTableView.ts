/**
 * Shared core logic for building TableView from tableId + locationIds.
 * Used by both getTableView (server page) and GET /api/tables/[id]/pos.
 */

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { tables, sessions, seats, orders, orderItems } from "@/lib/db/schema/orders";
import type { OutstandingItemsResult } from "@/app/actions/session-close-validation";
import { computeKitchenDelaysFromOrderItems } from "@/lib/pos/computeKitchenDelays";
import { computeOutstanding } from "@/lib/pos/computeOutstanding";
import {
  isTableView,
  type TableView,
  type TableViewUiMode,
  type TableViewServiceStage,
} from "@/lib/pos/tableView";
import { normalizeFurnitureStatus, type FurnitureStatus } from "@/lib/pos/tableStatus";

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
  const allReadyOrServed = active.every(
    (i) => i.status === "ready" || i.status === "served"
  );
  if (allReadyOrServed && active.some((i) => i.status === "ready")) return "ready";
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

export type BuildTableViewOptions = {
  /** Enable extreme delay warnings (used by API route ?debug_delays=1) */
  warnExtremeDelays?: boolean;
};

/**
 * Build TableView for a table. Returns null if table not found.
 * Caller must have already validated auth and locationIds.
 */
export async function buildTableView(
  tableId: string,
  locationIds: string[],
  options?: BuildTableViewOptions
): Promise<TableView | null> {
  const tableLookupMode = isValidUuid(tableId) ? "uuid" : "displayId";
  const displayIdForLookup =
    tableLookupMode === "displayId" ? tableId.trim().toUpperCase() : "";

  const table =
    tableLookupMode === "uuid"
      ? await db.query.tables.findFirst({
          where: and(eq(tables.id, tableId), inArray(tables.locationId, locationIds)),
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
            eq(tables.displayId, displayIdForLookup)
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
        });

  if (!table?.location) return null;

  const openSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.tableId, table.id), eq(sessions.status, "open")),
    columns: {
      id: true,
      guestCount: true,
      openedAt: true,
      status: true,
    },
    orderBy: (s, { desc }) => [desc(s.openedAt)],
  });

  const sessionId = openSession?.id ?? null;

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
            station: true,
            firedAt: true,
            status: true,
          },
          orderBy: (o, { asc }) => [asc(o.wave)],
        }),
      ])
    : [[], []];

  const orderById = new Map(orderRows.map((o) => [o.id, o]));
  const waveOrderByNumber = new Map(orderRows.map((o) => [o.wave, o]));
  const orderIdToStation = new Map(orderRows.map((o) => [o.id, o.station ?? null]));

  const orderIds = orderRows.map((o) => o.id);

  let itemRows: Awaited<ReturnType<typeof db.query.orderItems.findMany>>;
  let moneyRow: {
    pending_count: number | null;
    orders_total: string | null;
    payments_total: string | null;
    orders_subtotal: string | null;
    orders_tax: string | null;
  } | null;

  if (sessionId) {
    [itemRows, moneyRow] = await Promise.all([
      orderIds.length > 0
        ? db.query.orderItems.findMany({
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
              stationOverride: true,
            },
            orderBy: (i, { asc }) => [asc(i.createdAt)],
          })
        : Promise.resolve([]),
      (async () => {
        const rows = await db.execute(sql`
          SELECT
            p.pending_count,
            COALESCE(o.orders_total, 0)::numeric AS orders_total,
            COALESCE(p.payments_total, 0)::numeric AS payments_total,
            COALESCE(o.orders_subtotal, 0)::numeric AS orders_subtotal,
            COALESCE(o.orders_tax, 0)::numeric AS orders_tax
          FROM (SELECT 1 AS _dummy) _dummy
          LEFT JOIN LATERAL (
            SELECT
              count(*) FILTER (WHERE status IN ('pending'))::int AS pending_count,
              COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)::numeric AS payments_total
            FROM payments
            WHERE session_id = ${sessionId}
          ) p ON true
          LEFT JOIN LATERAL (
            SELECT
              COALESCE(SUM(total), 0)::numeric AS orders_total,
              COALESCE(SUM(subtotal), 0)::numeric AS orders_subtotal,
              COALESCE(SUM(tax_amount), 0)::numeric AS orders_tax
            FROM orders
            WHERE session_id = ${sessionId} AND status != 'cancelled'
          ) o ON true
        `);
        const row = Array.isArray(rows) ? rows[0] : (rows as { rows?: unknown[] }).rows?.[0];
        return (
          (row as
            | {
                pending_count: number | null;
                orders_total: string;
                payments_total: string;
                orders_subtotal: string;
                orders_tax: string;
              }
            | undefined) ?? null
        );
      })(),
    ]);
  } else {
    itemRows = [];
    moneyRow = null;
  }

  const delays = sessionId
    ? computeKitchenDelaysFromOrderItems(
        itemRows.map((row) => ({
          id: row.id,
          orderId: row.orderId,
          sentToKitchenAt: row.sentToKitchenAt,
          readyAt: row.readyAt,
          voidedAt: row.voidedAt,
          stationOverride: row.stationOverride ?? null,
        })),
        orderIdToStation,
        { warningMinutes: 10, warnExtremeDelays: options?.warnExtremeDelays ?? false }
      )
    : null;

  const seatNumberBySeatId = new Map(seatRows.map((s) => [s.id, s.seatNumber]));

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
      (i) =>
        i.status === "sent" || i.status === "cooking" || i.status === "ready"
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

  const billRow =
    moneyRow != null
      ? {
          subtotal: moneyRow.orders_subtotal ?? "0",
          tax: moneyRow.orders_tax ?? "0",
          total: moneyRow.orders_total ?? "0",
        }
      : { subtotal: "0", tax: "0", total: "0" };

  let outstanding: OutstandingItemsResult;
  if (sessionId && openSession && moneyRow != null) {
    const result = computeOutstanding(
      openSession.status,
      orderRows,
      itemRows,
      {
        pendingCount: moneyRow.pending_count ?? 0,
        ordersTotal: Number(moneyRow.orders_total ?? 0),
        paymentsTotal: Number(moneyRow.payments_total ?? 0),
      }
    );
    outstanding = result.canClose
      ? { canClose: true }
      : {
          canClose: false,
          reason: result.reason,
          ...(result.reason === "unfinished_items" && {
            unfinishedItems: result.unfinishedItems,
          }),
          ...(result.reason === "unpaid_balance" && { remaining: result.remaining }),
        };
  } else {
    outstanding = { canClose: true };
  }

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

  if (!isTableView(tableView)) return null;
  return tableView;
}
