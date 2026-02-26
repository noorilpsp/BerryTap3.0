"use server";

import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { reservations as reservationsTable } from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { StoreReservation } from "@/store/types";

const DB_STATUS_TO_STORE: Record<string, StoreReservation["status"]> = {
  pending: "reserved",
  confirmed: "confirmed",
  seated: "seated",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "noShow",
};

/**
 * Map DB reservation row to StoreReservation
 */
function mapRowToStoreReservation(row: {
  id: string;
  partySize: number;
  reservationDate: Date | string;
  reservationTime: string;
  status: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  notes: string | null;
  tableId: string | null;
  createdAt: Date;
}): StoreReservation {
  const dateStr =
    row.reservationDate instanceof Date
      ? row.reservationDate.toISOString().slice(0, 10)
      : String(row.reservationDate).slice(0, 10);

  return {
    id: row.id,
    code: row.id.slice(0, 8).toUpperCase(),
    guestName: row.customerName,
    fullName: row.customerName,
    partySize: row.partySize,
    date: dateStr,
    time: row.reservationTime,
    status: DB_STATUS_TO_STORE[row.status] ?? "reserved",
    phone: row.customerPhone ?? undefined,
    email: row.customerEmail ?? undefined,
    table: row.tableId ?? null,
    tableId: row.tableId ?? null,
    zone: null,
    staff: null,
    staffId: null,
    notes: row.notes ?? undefined,
    timeline: [
      {
        event: "Booked",
        time: row.createdAt.toISOString(),
        user: row.customerName,
        avatar: "",
      },
    ],
  };
}

export interface GetReservationsFilters {
  status?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get reservations for a location with optional filters
 */
export async function getReservationsForLocation(
  locationId: string,
  filters?: GetReservationsFilters
): Promise<StoreReservation[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const conditions = [eq(reservationsTable.locationId, locationId)];

  if (filters?.status) {
    conditions.push(eq(reservationsTable.status, filters.status as any));
  }
  if (filters?.date) {
    conditions.push(eq(reservationsTable.reservationDate, filters.date as any));
  }
  if (filters?.startDate && filters?.endDate) {
    conditions.push(
      gte(reservationsTable.reservationDate, filters.startDate as any)
    );
    conditions.push(
      lte(reservationsTable.reservationDate, filters.endDate as any)
    );
  }

  const rows = await db.query.reservations.findMany({
    where: and(...conditions),
    orderBy: [
      desc(reservationsTable.reservationDate),
      desc(reservationsTable.reservationTime),
    ],
    limit: 200,
  });

  return rows.map((r) =>
    mapRowToStoreReservation({
      id: r.id,
      partySize: r.partySize,
      reservationDate: r.reservationDate,
      reservationTime: r.reservationTime,
      status: r.status,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      notes: r.notes,
      tableId: r.tableId,
      createdAt: r.createdAt,
    })
  );
}

const STORE_STATUS_TO_DB: Record<string, string> = {
  reserved: "pending",
  confirmed: "confirmed",
  seated: "seated",
  completed: "completed",
  noShow: "no_show",
  cancelled: "cancelled",
  late: "pending",
  waitlist: "pending",
};

export async function createReservation(
  locationId: string,
  data: {
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
    tableId?: string | null;
  }
): Promise<StoreReservation> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const [row] = await db
    .insert(reservationsTable)
    .values({
      locationId,
      partySize: data.partySize,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      status: "pending",
      customerName: data.customerName,
      customerPhone: data.customerPhone ?? null,
      customerEmail: data.customerEmail ?? null,
      notes: data.notes ?? null,
      tableId: data.tableId ?? null,
    })
    .returning();

  if (!row) throw new Error("Failed to create reservation");
  return mapRowToStoreReservation({
    id: row.id,
    partySize: row.partySize,
    reservationDate: row.reservationDate,
    reservationTime: row.reservationTime,
    status: row.status,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    notes: row.notes,
    tableId: row.tableId,
    createdAt: row.createdAt,
  });
}

export async function updateReservation(
  locationId: string,
  id: string,
  patch: Partial<{
    partySize: number;
    reservationDate: string;
    reservationTime: string;
    status: StoreReservation["status"];
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string;
    tableId: string | null;
  }>
): Promise<void> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const updatePayload: Record<string, unknown> = {};
  if (patch.partySize !== undefined) updatePayload.partySize = patch.partySize;
  if (patch.reservationDate !== undefined)
    updatePayload.reservationDate = patch.reservationDate;
  if (patch.reservationTime !== undefined)
    updatePayload.reservationTime = patch.reservationTime;
  if (patch.status !== undefined)
    updatePayload.status = STORE_STATUS_TO_DB[patch.status] ?? patch.status;
  if (patch.customerName !== undefined) updatePayload.customerName = patch.customerName;
  if (patch.customerPhone !== undefined) updatePayload.customerPhone = patch.customerPhone;
  if (patch.customerEmail !== undefined) updatePayload.customerEmail = patch.customerEmail;
  if (patch.notes !== undefined) updatePayload.notes = patch.notes;
  if (patch.tableId !== undefined) updatePayload.tableId = patch.tableId;
  updatePayload.updatedAt = new Date();

  await db
    .update(reservationsTable)
    .set(updatePayload as any)
    .where(
      and(
        eq(reservationsTable.id, id),
        eq(reservationsTable.locationId, locationId)
      )
    );
}
