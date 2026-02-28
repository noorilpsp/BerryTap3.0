import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tables as tablesTable } from "@/lib/db/schema/orders";
import type { StoreTableStatus } from "@/store/types";

export type TableDbStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "unavailable";

const DB_STATUSES = new Set<TableDbStatus>([
  "available",
  "occupied",
  "reserved",
  "unavailable",
]);

const STORE_STATUS_TO_DB: Record<StoreTableStatus, TableDbStatus> = {
  free: "available",
  active: "occupied",
  urgent: "occupied",
  billing: "occupied",
  closed: "available",
  reserved: "reserved",
  cleaning: "unavailable",
};

export function normalizeTableStatus(
  status?: string | null
): TableDbStatus | undefined {
  if (status == null) return undefined;
  if (status in STORE_STATUS_TO_DB) {
    return STORE_STATUS_TO_DB[status as StoreTableStatus];
  }
  if (DB_STATUSES.has(status as TableDbStatus)) {
    return status as TableDbStatus;
  }
  return undefined;
}

export type CreateTableMutationInput = {
  locationId: string;
  tableNumber: string;
  seats?: number | null;
  status?: string;
};

export type CreateTableMutationResult =
  | { ok: true; table: typeof tablesTable.$inferSelect }
  | { ok: false; reason: "invalid_status" | "table_number_exists" };

export async function createTableMutation(
  input: CreateTableMutationInput
): Promise<CreateTableMutationResult> {
  const normalizedStatus = normalizeTableStatus(input.status ?? "available");
  if (!normalizedStatus) return { ok: false, reason: "invalid_status" };

  const existingTable = await db.query.tables.findFirst({
    where: and(
      eq(tablesTable.locationId, input.locationId),
      eq(tablesTable.tableNumber, input.tableNumber)
    ),
    columns: { id: true },
  });
  if (existingTable) return { ok: false, reason: "table_number_exists" };

  const [newTable] = await db
    .insert(tablesTable)
    .values({
      locationId: input.locationId,
      tableNumber: input.tableNumber,
      seats: input.seats ?? null,
      status: normalizedStatus,
    })
    .returning();

  if (!newTable) return { ok: false, reason: "table_number_exists" };
  return { ok: true, table: newTable };
}

export type UpdateTableMutationPatch = Partial<{
  tableNumber: string;
  seats: number | null;
  status: string;
  guests: number;
  seatedAt: string | null;
  stage: string | null;
  alerts: unknown;
}>;

export type UpdateTableMutationResult =
  | { ok: true; table: typeof tablesTable.$inferSelect }
  | {
      ok: false;
      reason: "table_not_found" | "invalid_status" | "table_number_exists";
    };

export async function updateTableMutation(
  locationId: string,
  tableId: string,
  patch: UpdateTableMutationPatch
): Promise<UpdateTableMutationResult> {
  const existingTable = await db.query.tables.findFirst({
    where: and(
      eq(tablesTable.id, tableId),
      eq(tablesTable.locationId, locationId)
    ),
    columns: { id: true, tableNumber: true },
  });
  if (!existingTable) return { ok: false, reason: "table_not_found" };

  if (patch.tableNumber && patch.tableNumber !== existingTable.tableNumber) {
    const duplicateTable = await db.query.tables.findFirst({
      where: and(
        eq(tablesTable.locationId, locationId),
        eq(tablesTable.tableNumber, patch.tableNumber)
      ),
      columns: { id: true },
    });
    if (duplicateTable) return { ok: false, reason: "table_number_exists" };
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.tableNumber !== undefined) updateData.tableNumber = patch.tableNumber;
  if (patch.seats !== undefined) updateData.seats = patch.seats;
  if (patch.status !== undefined) {
    const normalizedStatus = normalizeTableStatus(patch.status);
    if (!normalizedStatus) return { ok: false, reason: "invalid_status" };
    updateData.status = normalizedStatus;
  }
  if (patch.guests !== undefined) updateData.guests = patch.guests;
  if (patch.seatedAt !== undefined) {
    updateData.seatedAt = patch.seatedAt ? new Date(patch.seatedAt) : null;
  }
  if (patch.stage !== undefined) updateData.stage = patch.stage;
  if (patch.alerts !== undefined) updateData.alerts = patch.alerts;

  const [updatedTable] = await db
    .update(tablesTable)
    .set(updateData)
    .where(
      and(
        eq(tablesTable.id, tableId),
        eq(tablesTable.locationId, locationId)
      )
    )
    .returning();

  if (!updatedTable) return { ok: false, reason: "table_not_found" };
  return { ok: true, table: updatedTable };
}

export async function deleteTableMutation(
  locationId: string,
  tableId: string
): Promise<{ ok: true } | { ok: false; reason: "table_not_found" }> {
  const [deleted] = await db
    .delete(tablesTable)
    .where(
      and(
        eq(tablesTable.id, tableId),
        eq(tablesTable.locationId, locationId)
      )
    )
    .returning({ id: tablesTable.id });

  if (!deleted) return { ok: false, reason: "table_not_found" };
  return { ok: true };
}

