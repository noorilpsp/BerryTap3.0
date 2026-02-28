import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations as reservationsTable } from "@/lib/db/schema/orders";
import type { StoreReservationStatus } from "@/store/types";

export type ReservationDbStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

const DB_STATUSES = new Set<ReservationDbStatus>([
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
]);

const STORE_STATUS_TO_DB: Record<StoreReservationStatus, ReservationDbStatus> = {
  reserved: "pending",
  confirmed: "confirmed",
  seated: "seated",
  completed: "completed",
  noShow: "no_show",
  cancelled: "cancelled",
  late: "pending",
  waitlist: "pending",
};

function normalizeReservationStatus(
  status?: string | null
): ReservationDbStatus | undefined {
  if (status == null) return undefined;
  if (status in STORE_STATUS_TO_DB) {
    return STORE_STATUS_TO_DB[status as StoreReservationStatus];
  }
  if (DB_STATUSES.has(status as ReservationDbStatus)) {
    return status as ReservationDbStatus;
  }
  return undefined;
}

export type CreateReservationMutationInput = {
  locationId: string;
  customerId?: string | null;
  tableId?: string | null;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status?: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  notes?: string | null;
};

export async function createReservationMutation(
  input: CreateReservationMutationInput
): Promise<typeof reservationsTable.$inferSelect> {
  const normalizedStatus = normalizeReservationStatus(input.status ?? "pending");
  if (!normalizedStatus) {
    throw new Error(`Invalid reservation status: ${String(input.status)}`);
  }

  const [row] = await db
    .insert(reservationsTable)
    .values({
      locationId: input.locationId,
      customerId: input.customerId ?? null,
      tableId: input.tableId ?? null,
      partySize: input.partySize,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      status: normalizedStatus,
      customerName: input.customerName,
      customerPhone: input.customerPhone ?? null,
      customerEmail: input.customerEmail ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  if (!row) throw new Error("Failed to create reservation");
  return row;
}

export type UpdateReservationMutationPatch = Partial<{
  customerId: string | null;
  tableId: string | null;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
}>;

export async function updateReservationMutation(
  locationId: string,
  id: string,
  patch: UpdateReservationMutationPatch
): Promise<typeof reservationsTable.$inferSelect | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (patch.customerId !== undefined) updatePayload.customerId = patch.customerId;
  if (patch.tableId !== undefined) updatePayload.tableId = patch.tableId;
  if (patch.partySize !== undefined) updatePayload.partySize = patch.partySize;
  if (patch.reservationDate !== undefined) updatePayload.reservationDate = patch.reservationDate;
  if (patch.reservationTime !== undefined) updatePayload.reservationTime = patch.reservationTime;
  if (patch.status !== undefined) {
    const normalizedStatus = normalizeReservationStatus(patch.status);
    if (!normalizedStatus) {
      throw new Error(`Invalid reservation status: ${patch.status}`);
    }
    updatePayload.status = normalizedStatus;
  }
  if (patch.customerName !== undefined) updatePayload.customerName = patch.customerName;
  if (patch.customerPhone !== undefined) updatePayload.customerPhone = patch.customerPhone;
  if (patch.customerEmail !== undefined) updatePayload.customerEmail = patch.customerEmail;
  if (patch.notes !== undefined) updatePayload.notes = patch.notes;

  const [row] = await db
    .update(reservationsTable)
    .set(updatePayload)
    .where(
      and(
        eq(reservationsTable.id, id),
        eq(reservationsTable.locationId, locationId)
      )
    )
    .returning();

  return row ?? null;
}

export async function deleteReservationMutation(
  locationId: string,
  id: string
): Promise<boolean> {
  const [deleted] = await db
    .delete(reservationsTable)
    .where(
      and(
        eq(reservationsTable.id, id),
        eq(reservationsTable.locationId, locationId)
      )
    )
    .returning({ id: reservationsTable.id });

  return Boolean(deleted?.id);
}

