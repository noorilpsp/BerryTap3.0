"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  sessionEvents as sessionEventsTable,
  sessions as sessionsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";
import { getOpenSessionIdForTable } from "@/app/actions/orders";

export type SessionEventType =
  | "session_opened"
  | "guest_seated"
  | "items_added"
  | "order_sent"
  | "item_ready"
  | "served"
  | "bill_requested"
  | "payment_completed"
  | "payment_attempted"
  | "payment_failed"
  | "refund_issued"
  | "bill_split"
  | "course_fired"
  | "course_completed"
  | "item_refired"
  | "item_voided"
  | "runner_assigned"
  | "table_cleaned"
  | "kitchen_delay"
  | "guest_added"
  | "guest_removed"
  | "guest_count_adjusted";

export type SessionActorType = "server" | "kitchen" | "system" | "runner" | "customer";

export type SessionEventActor = {
  actorType: SessionActorType;
  actorId: string;
};

/** Record an operational event for a session. Use for analytics and audit. */
export async function recordSessionEvent(
  locationId: string,
  sessionId: string,
  type: SessionEventType,
  meta?: Record<string, unknown>,
  actor?: SessionEventActor
): Promise<{ ok: boolean; error?: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    return { ok: false, error: "Unauthorized or location not found" };
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session || session.locationId !== locationId) {
    return { ok: false, error: "Session not found" };
  }

  await db.insert(sessionEventsTable).values({
    sessionId,
    type,
    meta: meta ?? null,
    ...(actor && {
      actorType: actor.actorType,
      actorId: actor.actorId,
    }),
  });
  return { ok: true };
}

/** Look up open session by table id (e.g. "t1") and record an event. Use when you don't have sessionId. */
export async function recordSessionEventByTable(
  locationId: string,
  tableId: string,
  type: SessionEventType,
  meta?: Record<string, unknown>,
  actor?: SessionEventActor
): Promise<{ ok: boolean; error?: string }> {
  const sessionId = await getOpenSessionIdForTable(locationId, tableId);
  if (!sessionId) return { ok: false, error: "No open session for table" };
  return recordSessionEvent(locationId, sessionId, type, meta, actor);
}
