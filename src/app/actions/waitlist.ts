"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { waitlist as waitlistTable } from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import type { WaitlistEntry } from "@/store/types";

/**
 * Get waitlist entries for a location
 */
export async function getWaitlistForLocation(
  locationId: string
): Promise<WaitlistEntry[]> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const rows = await db.query.waitlist.findMany({
    where: eq(waitlistTable.locationId, locationId),
    orderBy: (w, { asc }) => [asc(w.addedAt)],
  });

  return rows.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    partySize: r.partySize,
    phone: r.phone ?? undefined,
    addedAt: r.addedAt.toISOString(),
    waitTime: r.waitTime ?? "—",
    notes: r.notes ?? undefined,
  }));
}

export async function addToWaitlist(
  locationId: string,
  data: { guestName: string; partySize: number; phone?: string; notes?: string; waitTime?: string }
): Promise<{ id: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  const [inserted] = await db
    .insert(waitlistTable)
    .values({
      locationId,
      guestName: data.guestName,
      partySize: data.partySize,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
      waitTime: data.waitTime ?? null,
    })
    .returning({ id: waitlistTable.id });

  if (!inserted) throw new Error("Failed to add to waitlist");
  return { id: inserted.id };
}

export async function removeFromWaitlist(
  locationId: string,
  waitlistId: string
): Promise<void> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  await db
    .delete(waitlistTable)
    .where(
      and(
        eq(waitlistTable.id, waitlistId),
        eq(waitlistTable.locationId, locationId)
      )
    );
}

export async function updateWaitlistEntry(
  locationId: string,
  waitlistId: string,
  data: { guestName?: string; partySize?: number; phone?: string; notes?: string; waitTime?: string }
): Promise<void> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    throw new Error("Unauthorized or location not found");
  }

  await db
    .update(waitlistTable)
    .set({
      ...(data.guestName !== undefined && { guestName: data.guestName }),
      ...(data.partySize !== undefined && { partySize: data.partySize }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.waitTime !== undefined && { waitTime: data.waitTime }),
      updatedAt: new Date(),
    })
    .where(eq(waitlistTable.id, waitlistId));
}
