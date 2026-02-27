"use server";

import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions as sessionsTable,
  tables as tablesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";

/**
 * Get session duration in minutes. For closed sessions: closedAt - openedAt.
 * For open sessions: now - openedAt (returns in-progress duration).
 */
export async function getSessionDuration(
  sessionId: string
): Promise<{ ok: true; durationMinutes: number } | { ok: false; error: string }> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true, openedAt: true, closedAt: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const end = session.closedAt ?? new Date();
  const durationMs = end.getTime() - session.openedAt.getTime();
  const durationMinutes = Math.max(0, Math.round(durationMs / 60_000));
  return { ok: true, durationMinutes };
}

/**
 * Get average turn time for a table in minutes. Turn time = session duration
 * (openedAt to closedAt) for closed sessions at that table.
 */
export async function getTableTurnTime(
  tableId: string
): Promise<
  | { ok: true; averageMinutes: number; sessionCount: number }
  | { ok: false; error: string }
> {
  const table = await db.query.tables.findFirst({
    where: eq(tablesTable.id, tableId),
    columns: { id: true, locationId: true },
  });
  if (!table) return { ok: false, error: "Table not found" };

  const location = await verifyLocationAccess(table.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const rows = await db
    .select({
      durationMinutes: sql<number>`EXTRACT(EPOCH FROM (${sessionsTable.closedAt} - ${sessionsTable.openedAt})) / 60`,
    })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.tableId, tableId),
        sql`${sessionsTable.closedAt} IS NOT NULL`
      )
    );

  if (rows.length === 0) {
    return { ok: true, averageMinutes: 0, sessionCount: 0 };
  }

  const total = rows.reduce((sum, r) => sum + (r.durationMinutes ?? 0), 0);
  const averageMinutes = Math.round(total / rows.length);
  return { ok: true, averageMinutes, sessionCount: rows.length };
}

/**
 * Get average prep time for a location in minutes. Prep time = readyAt - sentToKitchenAt
 * for non-voided order items that have both timestamps.
 */
export async function getAveragePrepTime(
  locationId: string
): Promise<
  | { ok: true; averageMinutes: number; itemCount: number }
  | { ok: false; error: string }
> {
  const location = await verifyLocationAccess(locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const rows = await db
    .select({
      prepMinutes: sql<number>`EXTRACT(EPOCH FROM (${orderItemsTable.readyAt} - ${orderItemsTable.sentToKitchenAt})) / 60`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(
      and(
        eq(ordersTable.locationId, locationId),
        isNull(orderItemsTable.voidedAt),
        sql`${orderItemsTable.sentToKitchenAt} IS NOT NULL`,
        sql`${orderItemsTable.readyAt} IS NOT NULL`
      )
    );

  if (rows.length === 0) {
    return { ok: true, averageMinutes: 0, itemCount: 0 };
  }

  const total = rows.reduce((sum, r) => sum + (r.prepMinutes ?? 0), 0);
  const averageMinutes = Math.round(total / rows.length);
  return { ok: true, averageMinutes, itemCount: rows.length };
}

/**
 * Get sessions for a server, optionally scoped by location.
 */
export async function getServerSessions(
  serverId: string,
  options?: { locationId?: string; limit?: number }
): Promise<
  | {
      ok: true;
      sessions: Array<{
        id: string;
        tableId: string;
        openedAt: Date;
        closedAt: Date | null;
        status: string;
        guestCount: number;
      }>;
    }
  | { ok: false; error: string }
> {
  if (options?.locationId) {
    const location = await verifyLocationAccess(options.locationId);
    if (!location)
      return { ok: false, error: "Unauthorized or location not found" };
  }

  const whereClause = options?.locationId
    ? and(
        eq(sessionsTable.serverId, serverId),
        eq(sessionsTable.locationId, options.locationId)
      )
    : eq(sessionsTable.serverId, serverId);

  let query = db
    .select({
      id: sessionsTable.id,
      tableId: sessionsTable.tableId,
      openedAt: sessionsTable.openedAt,
      closedAt: sessionsTable.closedAt,
      status: sessionsTable.status,
      guestCount: sessionsTable.guestCount,
    })
    .from(sessionsTable)
    .where(whereClause)
    .orderBy(desc(sessionsTable.openedAt));

  const sessions = await (options?.limit
    ? query.limit(options.limit)
    : query);

  return {
    ok: true,
    sessions: sessions.map((s) => ({
      id: s.id,
      tableId: s.tableId,
      openedAt: s.openedAt,
      closedAt: s.closedAt,
      status: s.status,
      guestCount: s.guestCount,
    })),
  };
}
