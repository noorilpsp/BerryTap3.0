"use server";

import { eq, and, ilike, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  tables as tablesTable,
  sessions as sessionsTable,
  seats as seatsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
  servicePeriods as servicePeriodsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { StoreTableSessionState, StoreOrderItem } from "@/store/types";
import { canCloseSession } from "@/app/actions/session-close-validation";
import { recordSessionEvent } from "@/app/actions/session-events";
import {
  markItemPreparing,
  markItemReady,
  markItemServed,
} from "@/app/actions/order-item-lifecycle";
import { addSeatToSession, syncSeatsWithGuestCount } from "@/app/actions/seat-management";
import { canFireWave, canAddItems } from "@/domain/serviceFlow";
import { recalculateSessionTotals } from "@/domain/orderTotals";

const ORDER_STATUS_ACTIVE = ["pending", "confirmed", "preparing", "ready"] as const;

function mapItemStatusToDb(
  status: StoreOrderItem["status"]
): "pending" | "preparing" | "ready" | "served" {
  switch (status) {
    case "held":
    case "sent":
      return "pending";
    case "cooking":
      return "preparing";
    case "ready":
      return "ready";
    case "served":
      return "served";
    default:
      return "pending";
  }
}

/**
 * Flatten session into line items with seat context. Skips void items.
 * Includes seatNumber (0 = shared) and waveNumber for seat_id and wave resolution.
 */
function flattenSessionToLines(session: StoreTableSessionState): Array<{
  name: string;
  price: number;
  status: "pending" | "preparing" | "ready" | "served";
  notes: string | null;
  seatNumber: number;
  waveNumber: number;
}> {
  const lines: Array<{
    name: string;
    price: number;
    status: "pending" | "preparing" | "ready" | "served";
    notes: string | null;
    seatNumber: number;
    waveNumber: number;
  }> = [];

  for (const seat of session.seats) {
    for (const item of seat.items) {
      if (item.status === "void") continue;
      const waveNumber = item.waveNumber ?? 1;
      const waveLabel = `Wave ${waveNumber}`;
      const notes = [seat.number > 0 ? `Seat ${seat.number}` : "Shared", waveLabel]
        .filter(Boolean)
        .join(" · ");
      lines.push({
        name: item.name.slice(0, 255),
        price: item.price,
        status: mapItemStatusToDb(item.status),
        notes: notes || null,
        seatNumber: seat.number,
        waveNumber,
      });
    }
  }

  for (const item of session.tableItems) {
    if (item.status === "void") continue;
    const waveNumber = item.waveNumber ?? 1;
    const waveLabel = `Wave ${waveNumber}`;
    const notes = ["Shared", waveLabel].filter(Boolean).join(" · ");
    lines.push({
      name: item.name.slice(0, 255),
      price: item.price,
      status: mapItemStatusToDb(item.status),
      notes: notes || null,
      seatNumber: 0,
      waveNumber,
    });
  }

  return lines;
}

/**
 * Sync seats with guest count. Uses syncSeatsWithGuestCount to create/mark seats.
 */
async function ensureSeatsForSession(
  sessionId: string,
  guestCount: number
): Promise<void> {
  const result = await syncSeatsWithGuestCount(sessionId, guestCount);
  if (!result.ok) {
    throw new Error(result.error ?? "Failed to sync seats");
  }
}

/**
 * Get seats for a session. For seat_id resolution (sync) use activeOnly: false (default).
 * For table UI display use activeOnly: true.
 */
export async function getSeatsForSession(
  sessionId: string,
  activeOnly = false
): Promise<Array<{ id: string; seatNumber: number; guestName: string | null }>> {
  const rows = await db.query.seats.findMany({
    where: activeOnly
      ? and(eq(seatsTable.sessionId, sessionId), eq(seatsTable.status, "active"))
      : eq(seatsTable.sessionId, sessionId),
    columns: { id: true, seatNumber: true, guestName: true },
    orderBy: (s, { asc }) => [asc(s.seatNumber)],
  });
  return rows.map((r) => ({
    id: r.id,
    seatNumber: r.seatNumber,
    guestName: r.guestName ?? null,
  }));
}

/**
 * Get the current service period id for a location based on current time.
 * Returns null if no matching period or no periods defined.
 */
async function getCurrentServicePeriodIdForLocation(
  locationId: string
): Promise<string | null> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hh}:${mm}`;

  const periods = await db.query.servicePeriods.findMany({
    where: eq(servicePeriodsTable.locationId, locationId),
    columns: { id: true, startTime: true, endTime: true },
  });
  for (const p of periods) {
    if (currentTime >= p.startTime && currentTime < p.endTime) {
      return p.id;
    }
  }
  return null;
}

/**
 * Get or create an open session for a table. At most one open session per table.
 */
async function getOrCreateSessionForTable(
  locationId: string,
  tableUuid: string,
  guestCount: number,
  serverId?: string | null
) {
  const existing = await db.query.sessions.findFirst({
    where: and(
      eq(sessionsTable.locationId, locationId),
      eq(sessionsTable.tableId, tableUuid),
      eq(sessionsTable.status, "open")
    ),
    columns: { id: true },
  });
  if (existing) return existing.id;

  const servicePeriodId = await getCurrentServicePeriodIdForLocation(locationId);
  const [inserted] = await db
    .insert(sessionsTable)
    .values({
      locationId,
      tableId: tableUuid,
      serverId: serverId ?? null,
      guestCount,
      status: "open",
      source: "walk_in",
      servicePeriodId: servicePeriodId ?? undefined,
      updatedAt: new Date(),
    })
    .returning({ id: sessionsTable.id });
  if (!inserted?.id) return null;
  await ensureSeatsForSession(inserted.id, guestCount);
  return inserted.id;
}

/**
 * Sync order + line items to DB for a table. Uses session + wave orders.
 * Finds or creates session for table, then finds or creates order (wave) for that session, replaces order_items.
 */
export async function syncOrderToDb(
  locationId: string,
  tableId: string,
  session: StoreTableSessionState
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    return { ok: false, error: "Unauthorized or location not found" };
  }

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true, tableNumber: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) {
    return { ok: false, error: "Table not found" };
  }

  const tableUuid = tableRow.id;
  const lines = flattenSessionToLines(session);
  const now = new Date();

  const sessionId = await getOrCreateSessionForTable(
    locationId,
    tableUuid,
    session.guestCount ?? 0
  );
  if (!sessionId) {
    return { ok: false, error: "Failed to get or create session" };
  }

  const sessionRow = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { status: true },
  });
  if (!sessionRow) {
    return { ok: false, error: "Session not found" };
  }
  const addResult = canAddItems({ status: sessionRow.status });
  if (!addResult.ok) {
    return { ok: false, error: "Cannot add items: session is not open" };
  }

  const guestCount = Math.max(1, Math.floor(session.guestCount ?? 0));
  await db
    .update(sessionsTable)
    .set({ guestCount, updatedAt: now })
    .where(eq(sessionsTable.id, sessionId));
  await ensureSeatsForSession(sessionId, guestCount);
  const seatRows = await getSeatsForSession(sessionId);
  const seatNumberToId = new Map(seatRows.map((s) => [s.seatNumber, s.id]));

  const linesByWave = new Map<number, typeof lines>();
  for (const line of lines) {
    const wave = Math.max(1, line.waveNumber);
    const list = linesByWave.get(wave) ?? [];
    list.push(line);
    linesByWave.set(wave, list);
  }
  const waveNumbers =
    linesByWave.size > 0
      ? Array.from(linesByWave.keys()).sort((a, b) => a - b)
      : [1];
  const numMatch = tableRow.tableNumber.match(/^[A-Za-z]*(\d+)$/);
  const tableNum = numMatch ? numMatch[1] : "1";

  for (const waveNumber of waveNumbers) {
    const waveLines = linesByWave.get(waveNumber) ?? [];
    let orderRow = await db.query.orders.findFirst({
      where: and(
        eq(ordersTable.sessionId, sessionId),
        eq(ordersTable.wave, waveNumber)
      ),
      columns: { id: true, orderNumber: true },
    });

    if (!orderRow) {
      const orderNumber = `T${tableNum}-${Date.now().toString(36).slice(-6)}`.slice(0, 20);
      const [inserted] = await db
        .insert(ordersTable)
        .values({
          sessionId,
          wave: waveNumber,
          locationId,
          tableId: tableUuid,
          orderNumber,
          orderType: "dine_in",
          status: "pending",
          paymentStatus: "unpaid",
          paymentTiming: "pay_later",
          subtotal: "0",
          taxAmount: "0",
          serviceCharge: "0",
          tipAmount: "0",
          discountAmount: "0",
          total: "0",
          firedAt: waveNumber === 1 ? now : null,
          station: null,
          updatedAt: now,
        })
        .returning({ id: ordersTable.id });
      if (!inserted) return { ok: false, error: "Failed to create order" };
      orderRow = { id: inserted.id, orderNumber };
    }

    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, orderRow.id));

    const subtotal = waveLines.reduce((sum, l) => sum + l.price, 0);

    if (waveLines.length > 0) {
      await db.insert(orderItemsTable).values(
        waveLines.map((line) => {
          const seatId = line.seatNumber > 0 ? seatNumberToId.get(line.seatNumber) ?? null : null;
          return {
            orderId: orderRow.id,
            itemName: line.name,
            itemPrice: line.price.toFixed(2),
            quantity: 1,
            seat: line.seatNumber,
            ...(seatId && { seatId }),
            customizationsTotal: "0.00",
            lineTotal: line.price.toFixed(2),
            notes: line.notes ?? null,
            status: line.status,
            sentToKitchenAt: now,
          };
        })
      );
    }

    await db
      .update(ordersTable)
      .set({
        subtotal: subtotal.toFixed(2),
        taxAmount: "0.00",
        total: subtotal.toFixed(2),
        updatedAt: now,
      })
      .where(eq(ordersTable.id, orderRow.id));
  }

  return { ok: true, sessionId };
}

/** Get or create an open session for a table (by table id string e.g. "t1"). Returns sessionId for recording events. */
export async function ensureSessionForTable(
  locationId: string,
  tableId: string,
  guestCount: number,
  serverId?: string | null
): Promise<string | null> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return null;

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) return null;

  return getOrCreateSessionForTable(locationId, tableRow.id, guestCount, serverId);
}

/** Get open session id for a table (by table id string). Returns null if no open session. */
export async function getOpenSessionIdForTable(
  locationId: string,
  tableId: string
): Promise<string | null> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return null;

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) return null;

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessionsTable.locationId, locationId),
      eq(sessionsTable.tableId, tableRow.id),
      eq(sessionsTable.status, "open")
    ),
    columns: { id: true },
  });
  return session?.id ?? null;
}

/**
 * Create the next order wave for a session. Finds highest wave number and creates a new order
 * with wave = highest + 1, status = pending, fired_at = null, station = null.
 */
export async function createNextWave(
  sessionId: string
): Promise<{ ok: true; order: { id: string; wave: number } } | { ok: false; error: string }> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true, tableId: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const [maxRow] = await db
    .select({
      maxWave: sql<number>`COALESCE(MAX(${ordersTable.wave}), 0)::int`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.sessionId, sessionId));
  const highestWave = maxRow?.maxWave ?? 0;
  const nextWave = highestWave + 1;

  const tableRow = session.tableId
    ? await db.query.tables.findFirst({
        where: eq(tablesTable.id, session.tableId),
        columns: { tableNumber: true },
      })
    : null;
  const tableNum = tableRow?.tableNumber?.match(/^[A-Za-z]*(\d+)$/)?.[1] ?? "1";
  const orderNumber = `T${tableNum}-${Date.now().toString(36).slice(-6)}`.slice(0, 20);
  const now = new Date();

  const [inserted] = await db
    .insert(ordersTable)
    .values({
      sessionId,
      wave: nextWave,
      locationId: session.locationId,
      tableId: session.tableId,
      orderNumber,
      orderType: "dine_in",
      status: "pending",
      paymentStatus: "unpaid",
      paymentTiming: "pay_later",
      subtotal: "0",
      taxAmount: "0",
      serviceCharge: "0",
      tipAmount: "0",
      discountAmount: "0",
      total: "0",
      firedAt: null,
      station: null,
      updatedAt: now,
    })
    .returning({ id: ordersTable.id, wave: ordersTable.wave });

  if (!inserted) return { ok: false, error: "Failed to create order" };
  return { ok: true, order: { id: inserted.id, wave: inserted.wave } };
}

/**
 * Fire a wave: set fired_at = now, status = confirmed, update order_items.sent_to_kitchen_at
 * if not set, and record session event course_fired.
 */
export async function fireWave(
  orderId: string
): Promise<{ ok: boolean; error?: string }> {
  const order = await db.query.orders.findFirst({
    where: eq(ordersTable.id, orderId),
    columns: {
      id: true,
      sessionId: true,
      locationId: true,
      wave: true,
      firedAt: true,
    },
  });
  if (!order) return { ok: false, error: "Order not found" };

  const location = await verifyLocationAccess(order.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const fireResult = canFireWave({ firedAt: order.firedAt });
  if (!fireResult.ok) {
    return { ok: false, error: "Wave already fired" };
  }

  const now = new Date();

  await db
    .update(ordersTable)
    .set({
      firedAt: now,
      status: "confirmed",
      updatedAt: now,
    })
    .where(eq(ordersTable.id, orderId));

  const items = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, orderId),
      isNull(orderItemsTable.sentToKitchenAt)
    ),
    columns: { id: true },
  });
  for (const item of items) {
    await db
      .update(orderItemsTable)
      .set({ sentToKitchenAt: now })
      .where(eq(orderItemsTable.id, item.id));
  }

  if (order.sessionId) {
    await recordSessionEvent(order.locationId, order.sessionId, "course_fired", {
      wave: order.wave,
    });
  }

  return { ok: true };
}

/** Get order id for a session and wave number. Used to wire fireWave from table page. */
export async function getOrderIdForSessionAndWave(
  sessionId: string,
  waveNumber: number
): Promise<string | null> {
  const order = await db.query.orders.findFirst({
    where: and(
      eq(ordersTable.sessionId, sessionId),
      eq(ordersTable.wave, waveNumber)
    ),
    columns: { id: true },
  });
  return order?.id ?? null;
}

/** Advance all items in a wave to a kitchen status and set timestamps. Used by table detail and KDS. */
export async function advanceOrderWaveStatus(
  locationId: string,
  tableId: string,
  waveNumber: number,
  status: "preparing" | "ready" | "served"
): Promise<{ ok: boolean; error?: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const sessionId = await getOpenSessionIdForTable(locationId, tableId);
  if (!sessionId) return { ok: false, error: "No open session for table" };

  const orderRow = await db.query.orders.findFirst({
    where: and(
      eq(ordersTable.sessionId, sessionId),
      eq(ordersTable.wave, waveNumber)
    ),
    columns: { id: true },
  });
  if (!orderRow) return { ok: false, error: "Order (wave) not found" };

  const items = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.orderId, orderRow.id),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true },
  });
  const helper =
    status === "preparing"
      ? markItemPreparing
      : status === "ready"
        ? markItemReady
        : markItemServed;

  for (const item of items) {
    const result = await helper(item.id);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
  }

  return { ok: true };
}

/** DB order item status */
const ORDER_ITEM_STATUS = ["pending", "preparing", "ready", "served"] as const;

export type OrderForTableItem = {
  /** DB order_items.id when loaded from database; omit for draft items. */
  id?: string;
  name: string;
  price: number;
  quantity: number;
  status: (typeof ORDER_ITEM_STATUS)[number];
  notes: string | null;
  /** From DB: seat number (0 = shared). Use for seat assignment when loading. */
  seatNumber?: number;
  /** From DB: seat_id when using seats table. */
  seatId?: string | null;
};

export type OrderForTableResult = {
  guestCount: number;
  seatedAt: string | null;
  items: OrderForTableItem[];
  /** Set when table has an open session (so UI can load seats from DB). */
  sessionId?: string | null;
} | null;

/**
 * Load active order + items for a table from DB. Prefers session-based model; falls back to legacy orders.
 */
export async function getOrderForTable(
  locationId: string,
  tableId: string
): Promise<OrderForTableResult> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return null;

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true, guests: true, seatedAt: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) return null;

  const guestCount = tableRow.guests ?? 0;
  const seatedAt = tableRow.seatedAt?.toISOString() ?? null;

  const openSession = await db.query.sessions.findFirst({
    where: and(
      eq(sessionsTable.locationId, locationId),
      eq(sessionsTable.tableId, tableRow.id),
      eq(sessionsTable.status, "open")
    ),
    columns: { id: true, guestCount: true, openedAt: true },
  });

  if (openSession) {
    const sessionOrders = await db.query.orders.findMany({
      where: eq(ordersTable.sessionId, openSession.id),
      columns: { id: true },
    });
    const orderIds = sessionOrders.map((o) => o.id);
    if (orderIds.length === 0) {
      return {
        guestCount: openSession.guestCount ?? guestCount,
        seatedAt: seatedAt ?? openSession.openedAt?.toISOString() ?? null,
        items: [],
        sessionId: openSession.id,
      };
    }
    const rows = await db.query.orderItems.findMany({
      where: inArray(orderItemsTable.orderId, orderIds),
      columns: {
        id: true,
        itemName: true,
        itemPrice: true,
        quantity: true,
        status: true,
        notes: true,
        seat: true,
        seatId: true,
      },
    });
    const seatIds = rows.map((r) => r.seatId).filter((id): id is string => !!id);
    const seatIdToNumber = new Map<string, number>();
    if (seatIds.length > 0) {
      const seatRows = await db.query.seats.findMany({
        where: inArray(seatsTable.id, seatIds),
        columns: { id: true, seatNumber: true },
      });
      seatRows.forEach((s) => seatIdToNumber.set(s.id, s.seatNumber));
    }
    const items: OrderForTableItem[] = rows.map((r) => {
      const seatNumber =
        r.seatId != null
          ? seatIdToNumber.get(r.seatId) ?? r.seat ?? 0
          : r.seat ?? 0;
      return {
        id: r.id,
        name: r.itemName,
        price: Number(r.itemPrice),
        quantity: r.quantity ?? 1,
        status: ORDER_ITEM_STATUS.includes(r.status as (typeof ORDER_ITEM_STATUS)[number])
          ? (r.status as (typeof ORDER_ITEM_STATUS)[number])
          : "pending",
        notes: r.notes,
        seatNumber,
        seatId: r.seatId ?? null,
      };
    });
    return {
      guestCount: openSession.guestCount ?? guestCount,
      seatedAt: seatedAt ?? openSession.openedAt?.toISOString() ?? null,
      items,
      sessionId: openSession.id,
    };
  }

  /** @deprecated Legacy: look up order by table_id without session. Prefer session-based flow; remove when all data is migrated. */
  const orderRow = await db.query.orders.findFirst({
    where: and(
      eq(ordersTable.locationId, locationId),
      eq(ordersTable.tableId, tableRow.id),
      inArray(ordersTable.status, ORDER_STATUS_ACTIVE)
    ),
    columns: { id: true },
  });

  if (!orderRow) {
    if (guestCount <= 0) return null;
    return { guestCount, seatedAt, items: [] };
  }

  const rows = await db.query.orderItems.findMany({
    where: eq(orderItemsTable.orderId, orderRow.id),
    columns: {
      id: true,
      itemName: true,
      itemPrice: true,
      quantity: true,
      status: true,
      notes: true,
      seat: true,
      seatId: true,
    },
  });
  const legacySeatIds = rows.map((r) => r.seatId).filter((id): id is string => !!id);
  const legacySeatIdToNumber = new Map<string, number>();
  if (legacySeatIds.length > 0) {
    const seatRows = await db.query.seats.findMany({
      where: inArray(seatsTable.id, legacySeatIds),
      columns: { id: true, seatNumber: true },
    });
    seatRows.forEach((s) => legacySeatIdToNumber.set(s.id, s.seatNumber));
  }
  const items: OrderForTableItem[] = rows.map((r) => {
    const seatNumber =
      r.seatId != null
        ? legacySeatIdToNumber.get(r.seatId) ?? r.seat ?? 0
        : r.seat ?? 0;
    return {
      id: r.id,
      name: r.itemName,
      price: Number(r.itemPrice),
      quantity: r.quantity ?? 1,
      status: ORDER_ITEM_STATUS.includes(r.status as (typeof ORDER_ITEM_STATUS)[number])
        ? (r.status as (typeof ORDER_ITEM_STATUS)[number])
        : "pending",
      notes: r.notes,
      seatNumber,
      seatId: r.seatId ?? null,
    };
  });

  return { guestCount, seatedAt, items };
}

/** Optional payment to record when closing a session. */
export type CloseTablePayment = {
  amount: number;
  tipAmount?: number;
  method?: "card" | "cash" | "mobile" | "other";
};

/** Options for closing a table session. */
export type CloseOrderForTableOptions = {
  /** Manager override: skip validation, void blocking items, record forced_close event. */
  force?: boolean;
};

export type CloseOrderForTableResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      reason?: "session_not_open" | "unfinished_items" | "unpaid_balance" | "payment_in_progress" | "kitchen_mid_fire" | "invalid_tip";
      items?: Array<{ id: string; itemName: string; status: string; quantity: number }>;
      remaining?: number;
      sessionTotal?: number;
      paymentsTotal?: number;
    };

/**
 * Close the active session for a table (and mark its orders completed). If payment is provided and
 * there is an open session, inserts a payment row then closes the session.
 * Validates session is in a safe state unless force=true (manager override).
 */
export async function closeOrderForTable(
  locationId: string,
  tableId: string,
  payment?: CloseTablePayment,
  options?: CloseOrderForTableOptions
): Promise<CloseOrderForTableResult> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    return { ok: false, error: "Unauthorized or location not found" };
  }

  const tableRows = await db.query.tables.findMany({
    where: and(
      eq(tablesTable.locationId, locationId),
      ilike(tablesTable.tableNumber, tableId)
    ),
    columns: { id: true },
    limit: 1,
  });
  const tableRow = tableRows[0];
  if (!tableRow) return { ok: false, error: "Table not found" };

  const now = new Date();

  const openSession = await db.query.sessions.findFirst({
    where: and(
      eq(sessionsTable.locationId, locationId),
      eq(sessionsTable.tableId, tableRow.id),
      eq(sessionsTable.status, "open")
    ),
    columns: { id: true },
  });

  if (openSession) {
    const force = options?.force === true;

    // Validate tip amount when payment is provided
    if (payment && (payment.tipAmount ?? 0) < 0) {
      return {
        ok: false,
        error: "Tip amount must be >= 0",
        reason: "invalid_tip",
      };
    }

    if (!force) {
      await recalculateSessionTotals(openSession.id);
      const canClose = await canCloseSession(openSession.id, {
        incomingPaymentAmount: payment?.amount,
      });
      if (!canClose.ok) {
        const err: CloseOrderForTableResult = {
          ok: false,
          error: `Cannot close session: ${canClose.reason}`,
          reason: canClose.reason,
        };
        if (canClose.reason === "unfinished_items") {
          err.items = canClose.items;
        }
        if (canClose.reason === "unpaid_balance") {
          err.remaining = canClose.remaining;
          err.sessionTotal = canClose.sessionTotal;
          err.paymentsTotal = canClose.paymentsTotal;
        }
        return err;
      }
    } else {
      const ordersForSession = await db.query.orders.findMany({
        where: eq(ordersTable.sessionId, openSession.id),
        columns: { id: true },
      });
      const orderIds = ordersForSession.map((o) => o.id);
      if (orderIds.length > 0) {
        const unfinishedItems = await db.query.orderItems.findMany({
          where: and(
            inArray(orderItemsTable.orderId, orderIds),
            inArray(orderItemsTable.status, ["pending", "preparing", "ready"]),
            isNull(orderItemsTable.voidedAt)
          ),
          columns: { id: true },
        });
        if (unfinishedItems.length > 0) {
          for (const item of unfinishedItems) {
            await db
              .update(orderItemsTable)
              .set({ voidedAt: now })
              .where(eq(orderItemsTable.id, item.id));
          }
        }
      }
      await recordSessionEvent(locationId, openSession.id, "payment_completed", {
        forced_close: true,
        reason: "manager_override",
      });
    }

    if (payment && payment.amount > 0) {
      await db.insert(paymentsTable).values({
        sessionId: openSession.id,
        amount: payment.amount.toFixed(2),
        tipAmount: (payment.tipAmount ?? 0).toFixed(2),
        method: payment.method ?? "other",
        status: "completed",
        paidAt: now,
      });
      await recalculateSessionTotals(openSession.id);
    }

    await db
      .update(sessionsTable)
      .set({ status: "closed", closedAt: now, updatedAt: now })
      .where(eq(sessionsTable.id, openSession.id));

    await db
      .update(ordersTable)
      .set({ status: "completed", completedAt: now, updatedAt: now })
      .where(eq(ordersTable.sessionId, openSession.id));
    return { ok: true };
  }

  /** @deprecated Legacy: close order by table_id when no session exists. Remove when all data is migrated. */
  const orderRow = await db.query.orders.findFirst({
    where: and(
      eq(ordersTable.locationId, locationId),
      eq(ordersTable.tableId, tableRow.id),
      inArray(ordersTable.status, ORDER_STATUS_ACTIVE)
    ),
    columns: { id: true },
  });
  if (!orderRow) return { ok: true };

  await db
    .update(ordersTable)
    .set({ status: "completed", completedAt: now, updatedAt: new Date() })
    .where(eq(ordersTable.id, orderRow.id));

  return { ok: true };
}
