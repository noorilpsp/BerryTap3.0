"use server";

import { eq, and, ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  tables as tablesTable,
  sessions as sessionsTable,
  seats as seatsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { StoreTableSessionState, StoreOrderItem } from "@/store/types";

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
 * Includes seatNumber (0 = shared) for seat_id resolution.
 */
function flattenSessionToLines(session: StoreTableSessionState): Array<{
  name: string;
  price: number;
  status: "pending" | "preparing" | "ready" | "served";
  notes: string | null;
  seatNumber: number;
}> {
  const lines: Array<{
    name: string;
    price: number;
    status: "pending" | "preparing" | "ready" | "served";
    notes: string | null;
    seatNumber: number;
  }> = [];

  for (const seat of session.seats) {
    for (const item of seat.items) {
      if (item.status === "void") continue;
      const waveLabel = item.waveNumber ? `Wave ${item.waveNumber}` : "";
      const notes = [seat.number > 0 ? `Seat ${seat.number}` : "Shared", waveLabel]
        .filter(Boolean)
        .join(" · ");
      lines.push({
        name: item.name.slice(0, 255),
        price: item.price,
        status: mapItemStatusToDb(item.status),
        notes: notes || null,
        seatNumber: seat.number,
      });
    }
  }

  for (const item of session.tableItems) {
    if (item.status === "void") continue;
    const waveLabel = item.waveNumber ? `Wave ${item.waveNumber}` : "";
    const notes = ["Shared", waveLabel].filter(Boolean).join(" · ");
    lines.push({
      name: item.name.slice(0, 255),
      price: item.price,
      status: mapItemStatusToDb(item.status),
      notes: notes || null,
      seatNumber: 0,
    });
  }

  return lines;
}

/**
 * Ensure a session has seats for seat_number 1..guestCount. Creates any missing seats.
 */
async function ensureSeatsForSession(
  sessionId: string,
  guestCount: number
): Promise<void> {
  const existing = await db.query.seats.findMany({
    where: eq(seatsTable.sessionId, sessionId),
    columns: { seatNumber: true },
  });
  const existingNumbers = new Set(existing.map((s) => s.seatNumber));
  const toCreate: number[] = [];
  for (let n = 1; n <= Math.max(1, guestCount); n++) {
    if (!existingNumbers.has(n)) toCreate.push(n);
  }
  if (toCreate.length === 0) return;
  const now = new Date();
  await db.insert(seatsTable).values(
    toCreate.map((seatNumber) => ({
      sessionId,
      seatNumber,
      updatedAt: now,
    }))
  );
}

/**
 * Get all seats for a session (for resolving seat_id from seat number in POS).
 */
export async function getSeatsForSession(sessionId: string): Promise<
  Array<{ id: string; seatNumber: number; guestName: string | null }>
> {
  const rows = await db.query.seats.findMany({
    where: eq(seatsTable.sessionId, sessionId),
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

  const [inserted] = await db
    .insert(sessionsTable)
    .values({
      locationId,
      tableId: tableUuid,
      serverId: serverId ?? null,
      guestCount,
      status: "open",
      source: "walk_in",
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
  await ensureSeatsForSession(sessionId, session.guestCount ?? 0);
  const seatRows = await getSeatsForSession(sessionId);
  const seatNumberToId = new Map(seatRows.map((s) => [s.seatNumber, s.id]));

  const waveNumber = 1;
  let orderRow = await db.query.orders.findFirst({
    where: and(
      eq(ordersTable.sessionId, sessionId),
      eq(ordersTable.wave, waveNumber)
    ),
    columns: { id: true, orderNumber: true },
  });

  if (!orderRow) {
    const numMatch = tableRow.tableNumber.match(/^[A-Za-z]*(\d+)$/);
    const tableNum = numMatch ? numMatch[1] : "1";
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
        firedAt: now,
        updatedAt: now,
      })
      .returning({ id: ordersTable.id });

    if (!inserted) {
      return { ok: false, error: "Failed to create order (wave)" };
    }
    orderRow = { id: inserted.id, orderNumber };
  }

  await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, orderRow.id));

  const subtotal = lines.reduce((sum, l) => sum + l.price, 0);

  if (lines.length > 0) {
    await db.insert(orderItemsTable).values(
      lines.map((line) => {
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

  const now = new Date();
  const updates: Record<string, unknown> = { status };
  if (status === "preparing") updates.startedAt = now;
  if (status === "ready") updates.readyAt = now;
  if (status === "served") updates.servedAt = now;

  await db
    .update(orderItemsTable)
    .set(updates as Partial<typeof orderItemsTable.$inferInsert>)
    .where(eq(orderItemsTable.orderId, orderRow.id));

  return { ok: true };
}

/** DB order item status */
const ORDER_ITEM_STATUS = ["pending", "preparing", "ready", "served"] as const;

export type OrderForTableItem = {
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
        itemName: true,
        itemPrice: true,
        quantity: true,
        status: true,
        notes: true,
        seat: true,
        seatId: true,
      },
    });
    const items: OrderForTableItem[] = rows.map((r) => ({
      name: r.itemName,
      price: Number(r.itemPrice),
      quantity: r.quantity ?? 1,
      status: ORDER_ITEM_STATUS.includes(r.status as (typeof ORDER_ITEM_STATUS)[number])
        ? (r.status as (typeof ORDER_ITEM_STATUS)[number])
        : "pending",
      notes: r.notes,
      seatNumber: r.seat ?? 0,
      seatId: r.seatId ?? null,
    }));
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
      itemName: true,
      itemPrice: true,
      quantity: true,
      status: true,
      notes: true,
      seat: true,
      seatId: true,
    },
  });
  const items: OrderForTableItem[] = rows.map((r) => ({
    name: r.itemName,
    price: Number(r.itemPrice),
    quantity: r.quantity ?? 1,
    status: ORDER_ITEM_STATUS.includes(r.status as (typeof ORDER_ITEM_STATUS)[number])
      ? (r.status as (typeof ORDER_ITEM_STATUS)[number])
      : "pending",
    notes: r.notes,
    seatNumber: r.seat ?? 0,
    seatId: r.seatId ?? null,
  }));

  return { guestCount, seatedAt, items };
}

/** Optional payment to record when closing a session. */
export type CloseTablePayment = {
  amount: number;
  tipAmount?: number;
  method?: "card" | "cash" | "mobile" | "other";
};

/**
 * Close the active session for a table (and mark its orders completed). If payment is provided and
 * there is an open session, inserts a payment row then closes the session.
 */
export async function closeOrderForTable(
  locationId: string,
  tableId: string,
  payment?: CloseTablePayment
): Promise<{ ok: boolean; error?: string }> {
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
    if (payment && payment.amount > 0) {
      await db.insert(paymentsTable).values({
        sessionId: openSession.id,
        amount: payment.amount.toFixed(2),
        tipAmount: (payment.tipAmount ?? 0).toFixed(2),
        method: payment.method ?? "other",
        status: "completed",
        paidAt: now,
      });
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
