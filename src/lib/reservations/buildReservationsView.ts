/**
 * Shared core logic for building ReservationsView from locationId.
 * Used by getReservationsView (server layout) and GET /api/reservations/view.
 * Caller must have validated auth and location access.
 */

import { eq, and, desc, gte, lte, lt, asc, or, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { merchantLocations } from "@/lib/db/schema/merchant-locations";
import {
  reservations as reservationsTable,
  sessions as sessionsTable,
  waitlist as waitlistTable,
  servicePeriods as servicePeriodsTable,
} from "@/lib/db/schema/orders";
import type { StoreReservation, WaitlistEntry } from "@/store/types";
import type { ReservationsViewConfig } from "./reservationsView";
import { buildCapacitySlots } from "./buildCapacitySlots";

const DEFAULT_SERVICE_PERIODS: ReservationsViewConfig["servicePeriods"] = [
  { id: "lunch", name: "Lunch", start: "11:30", end: "14:30" },
  { id: "dinner", name: "Dinner", start: "17:00", end: "23:00" },
];

const DB_STATUS_TO_STORE: Record<string, StoreReservation["status"]> = {
  pending: "reserved",
  confirmed: "confirmed",
  seated: "seated",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "noShow",
};

function tableDisplayFromRow(
  table: { displayId: string | null; tableNumber: string } | null
): string | null {
  if (!table) return null;
  const raw = table.displayId ?? table.tableNumber;
  const match = raw?.match(/^[A-Za-z]*(\d+)$/);
  return match ? `T${match[1]}` : raw ?? null;
}

function mapRowToStoreReservation(row: {
  id: string;
  partySize: number;
  reservationDate: Date | string;
  reservationTime: string;
  status: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  notes: string | null;
  tableId: string | null;
  createdAt: Date;
  table?: { displayId: string | null; tableNumber: string } | null;
}): StoreReservation {
  const dateStr =
    row.reservationDate instanceof Date
      ? row.reservationDate.toISOString().slice(0, 10)
      : String(row.reservationDate).slice(0, 10);

  return {
    id: row.id,
    code: row.id.slice(0, 8).toUpperCase(),
    customerId: row.customerId ?? undefined,
    guestName: row.customerName,
    fullName: row.customerName,
    partySize: row.partySize,
    date: dateStr,
    time: row.reservationTime,
    status: DB_STATUS_TO_STORE[row.status] ?? "reserved",
    phone: row.customerPhone ?? undefined,
    email: row.customerEmail ?? undefined,
    table: tableDisplayFromRow(row.table ?? null) ?? row.tableId ?? null,
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

export interface BuildReservationsViewOptions {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * Build ReservationsView for a location. No auth — caller validates access.
 */
export async function buildReservationsView(
  locationId: string,
  options?: BuildReservationsViewOptions
): Promise<{
  locationId: string;
  reservations: StoreReservation[];
  waitlist: WaitlistEntry[];
}> {
  const conditions = [eq(reservationsTable.locationId, locationId)];

  if (options?.status) {
    conditions.push(eq(reservationsTable.status, options.status as "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show"));
  }
  if (options?.date) {
    conditions.push(eq(reservationsTable.reservationDate, options.date));
  }
  if (options?.startDate && options?.endDate) {
    conditions.push(gte(reservationsTable.reservationDate, options.startDate));
    conditions.push(lte(reservationsTable.reservationDate, options.endDate));
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const nextDayIso = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [locationRow, servicePeriodRows, reservationRows, waitlistRows, sessionRows] = await Promise.all([
    db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: { name: true, seatingCapacity: true, numberOfTables: true },
    }),
    db.query.servicePeriods.findMany({
      where: eq(servicePeriodsTable.locationId, locationId),
      orderBy: [asc(servicePeriodsTable.startTime)],
      columns: { id: true, name: true, startTime: true, endTime: true },
    }),
    db.query.reservations.findMany({
      where: and(...conditions),
      orderBy: [
        desc(reservationsTable.reservationDate),
        desc(reservationsTable.reservationTime),
      ],
      limit: 200,
      with: {
        table: { columns: { displayId: true, tableNumber: true } },
      },
    }),
    db.query.waitlist.findMany({
      where: eq(waitlistTable.locationId, locationId),
      orderBy: (w, { asc }) => [asc(w.addedAt)],
    }),
    db.query.sessions.findMany({
      where: and(
        eq(sessionsTable.locationId, locationId),
        ne(sessionsTable.status, "cancelled"),
        lt(sessionsTable.openedAt, new Date(`${nextDayIso}T00:00:00`)),
        or(
          isNull(sessionsTable.closedAt),
          gte(sessionsTable.closedAt, new Date(`${todayIso}T00:00:00`))
        )
      ),
      columns: {
        openedAt: true,
        closedAt: true,
        guestCount: true,
        status: true,
      },
    }),
  ]);

  const totalSeats = locationRow?.seatingCapacity != null
    ? Number(locationRow.seatingCapacity)
    : 78;
  const totalTables = locationRow?.numberOfTables != null
    ? Number(locationRow.numberOfTables)
    : 22;
  const locationName = locationRow?.name ?? "Restaurant";

  const servicePeriods: ReservationsViewConfig["servicePeriods"] =
    servicePeriodRows.length > 0
      ? servicePeriodRows.map((p) => ({
          id: p.id,
          name: p.name,
          start: p.startTime,
          end: p.endTime,
        }))
      : DEFAULT_SERVICE_PERIODS;

  const config: ReservationsViewConfig = {
    locationId,
    locationName,
    totalSeats,
    totalTables,
    servicePeriods,
  };

  const reservations = reservationRows.map((r) =>
    mapRowToStoreReservation({
      id: r.id,
      partySize: r.partySize,
      reservationDate: r.reservationDate,
      reservationTime: r.reservationTime,
      status: r.status,
      customerId: r.customerId ?? null,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      notes: r.notes,
      tableId: r.tableId,
      table: r.table ?? undefined,
      createdAt: r.createdAt,
    })
  );

  const waitlist: WaitlistEntry[] = waitlistRows.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    partySize: r.partySize,
    phone: r.phone ?? undefined,
    addedAt: r.addedAt.toISOString(),
    waitTime: r.waitTime ?? "—",
    notes: r.notes ?? undefined,
  }));

  const reservationsForToday = reservationRows.filter((r) => {
    const d = r.reservationDate instanceof Date ? r.reservationDate.toISOString().slice(0, 10) : String(r.reservationDate).slice(0, 10);
    return d === todayIso;
  });
  const sessionsForCapacity = sessionRows.map((s) => ({
    openedAt: s.openedAt,
    closedAt: s.closedAt,
    guestCount: s.guestCount,
    status: s.status,
  }));
  const capacitySlots = buildCapacitySlots(
    reservationsForToday.map((r) => ({
      date: r.reservationDate instanceof Date ? r.reservationDate.toISOString().slice(0, 10) : String(r.reservationDate),
      time: r.reservationTime,
      status: r.status,
      partySize: r.partySize,
    })),
    sessionsForCapacity,
    totalSeats,
    todayIso,
    { startTime: "17:00", endTime: "23:00" }
  );

  return {
    locationId,
    reservations,
    waitlist,
    config,
    capacitySlots,
  };
}
