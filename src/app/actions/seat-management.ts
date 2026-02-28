"use server";

import { eq, and, sql, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  seats as seatsTable,
  orderItems as orderItemsTable,
  sessions as sessionsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";

/**
 * Add a seat to a session. Uses next available seat_number (max + 1) unless seatNumber is provided.
 * Maintains unique (session_id, seat_number).
 */
export async function addSeatToSession(
  sessionId: string,
  seatNumber?: number
): Promise<
  | { ok: true; seat: { id: string; seatNumber: number } }
  | { ok: false; error: string }
> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  let targetNumber: number;
  if (seatNumber != null && seatNumber > 0) {
    const existing = await db.query.seats.findFirst({
      where: and(
        eq(seatsTable.sessionId, sessionId),
        eq(seatsTable.seatNumber, seatNumber)
      ),
      columns: { id: true },
    });
    if (existing) return { ok: false, error: `Seat ${seatNumber} already exists` };
    targetNumber = seatNumber;
  } else {
    const [maxRow] = await db
      .select({
        maxSeat: sql<number>`COALESCE(MAX(${seatsTable.seatNumber}), 0)::int`,
      })
      .from(seatsTable)
      .where(eq(seatsTable.sessionId, sessionId));
    targetNumber = (maxRow?.maxSeat ?? 0) + 1;
  }

  const now = new Date();
  const [inserted] = await db
    .insert(seatsTable)
    .values({
      sessionId,
      seatNumber: targetNumber,
      updatedAt: now,
    })
    .returning({ id: seatsTable.id, seatNumber: seatsTable.seatNumber });

  if (!inserted) return { ok: false, error: "Failed to create seat" };
  return {
    ok: true,
    seat: { id: inserted.id, seatNumber: inserted.seatNumber },
  };
}

/**
 * Remove a seat from a session. If order_items reference it, marks as removed instead of deleting
 * to preserve seat_id references. Otherwise deletes the seat.
 */
export async function removeSeatFromSession(
  seatId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const seat = await db.query.seats.findFirst({
    where: eq(seatsTable.id, seatId),
    columns: { id: true, sessionId: true },
  });
  if (!seat) return { ok: false, error: "Seat not found" };

  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, seat.sessionId),
    columns: { locationId: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const referencing = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.seatId, seatId),
      isNull(orderItemsTable.voidedAt)
    ),
    columns: { id: true },
    limit: 1,
  });
  const now = new Date();
  if (referencing.length > 0) {
    await db
      .update(seatsTable)
      .set({ status: "removed", updatedAt: now })
      .where(eq(seatsTable.id, seatId));
    return { ok: true };
  }

  await db.delete(seatsTable).where(eq(seatsTable.id, seatId));
  return { ok: true };
}

/**
 * Rename a seat (change seat_number). Updates legacy order_items.seat for items
 * that reference this seat (seat_id).
 */
export async function renameSeat(
  seatId: string,
  newSeatNumber: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(newSeatNumber) || newSeatNumber < 1) {
    return { ok: false, error: "Invalid seat number" };
  }

  const seat = await db.query.seats.findFirst({
    where: eq(seatsTable.id, seatId),
    columns: { id: true, sessionId: true, seatNumber: true },
  });
  if (!seat) return { ok: false, error: "Seat not found" };

  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, seat.sessionId),
    columns: { locationId: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const existing = await db.query.seats.findFirst({
    where: and(
      eq(seatsTable.sessionId, seat.sessionId),
      eq(seatsTable.seatNumber, newSeatNumber)
    ),
    columns: { id: true },
  });
  if (existing && existing.id !== seatId) {
    return { ok: false, error: `Seat ${newSeatNumber} already exists` };
  }

  const sentItems = await db.query.orderItems.findMany({
    where: and(
      eq(orderItemsTable.seatId, seatId),
      isNotNull(orderItemsTable.sentToKitchenAt)
    ),
    columns: { id: true },
    limit: 1,
  });
  if (sentItems.length > 0) {
    return { ok: false, error: "Cannot modify order items that have been sent to kitchen" };
  }

  const now = new Date();
  await db
    .update(seatsTable)
    .set({ seatNumber: newSeatNumber, updatedAt: now })
    .where(eq(seatsTable.id, seatId));

  await db
    .update(orderItemsTable)
    .set({ seat: newSeatNumber })
    .where(eq(orderItemsTable.seatId, seatId));

  return { ok: true };
}

/**
 * Rename seat by session and seat number. Looks up seat id and calls renameSeat.
 * Use when the UI only has sessionId, seatNumber, and newSeatNumber.
 */
export async function renameSeatBySessionAndNumber(
  sessionId: string,
  seatNumber: number,
  newSeatNumber: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const seat = await db.query.seats.findFirst({
    where: and(
      eq(seatsTable.sessionId, sessionId),
      eq(seatsTable.seatNumber, seatNumber)
    ),
    columns: { id: true },
  });
  if (!seat) return { ok: false, error: "Seat not found" };
  return renameSeat(seat.id, newSeatNumber);
}

/**
 * Sync seats with guest count. Creates seats 1..guestCount if missing, marks excess seats
 * as removed when count decreases (never deletes seats with order_items to preserve seat_id refs).
 * Seat numbers remain unique per session.
 */
export async function syncSeatsWithGuestCount(
  sessionId: string,
  guestCount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session) return { ok: false, error: "Session not found" };

  const location = await verifyLocationAccess(session.locationId);
  if (!location) return { ok: false, error: "Unauthorized or location not found" };

  const targetCount = Math.max(1, Math.floor(guestCount));
  const now = new Date();

  const existingSeats = await db.query.seats.findMany({
    where: eq(seatsTable.sessionId, sessionId),
    columns: { id: true, seatNumber: true, status: true },
  });
  const byNumber = new Map(existingSeats.map((s) => [s.seatNumber, s]));

  for (let n = 1; n <= targetCount; n++) {
    const seat = byNumber.get(n);
    if (!seat) {
      const [inserted] = await db
        .insert(seatsTable)
        .values({
          sessionId,
          seatNumber: n,
          status: "active",
          updatedAt: now,
        })
        .returning({ id: seatsTable.id });
      if (!inserted) return { ok: false, error: "Failed to create seat" };
    } else if (seat.status === "removed") {
      await db
        .update(seatsTable)
        .set({ status: "active", updatedAt: now })
        .where(eq(seatsTable.id, seat.id));
    }
  }

  for (const seat of existingSeats) {
    if (seat.seatNumber > targetCount) {
      await db
        .update(seatsTable)
        .set({ status: "removed", updatedAt: now })
        .where(eq(seatsTable.id, seat.id));
    }
  }

  return { ok: true };
}

/**
 * Remove seat by session and seat number. Looks up seat id and calls removeSeatFromSession.
 * Use when the UI only has sessionId and seatNumber.
 */
export async function removeSeatBySessionAndNumber(
  sessionId: string,
  seatNumber: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const seat = await db.query.seats.findFirst({
    where: and(
      eq(seatsTable.sessionId, sessionId),
      eq(seatsTable.seatNumber, seatNumber)
    ),
    columns: { id: true },
  });
  if (!seat) return { ok: false, error: "Seat not found" };
  return removeSeatFromSession(seat.id);
}
