"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  sessionEvents as sessionEventsTable,
  sessions as sessionsTable,
} from "@/lib/db/schema/orders";
import { verifyLocationAccess } from "@/lib/location-access";

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

/** Indicates where the action originated. Use for debugging and analytics. */
export type EventSource = "table_page" | "kds" | "api" | "system";

/** Metadata stored in session_events.meta (jsonb). source and correlationId are optional but recommended. */
export type SessionEventMeta = {
  source?: EventSource;
  correlationId?: string;
  [key: string]: unknown;
};

export type SessionEventActor = {
  actorType: SessionActorType;
  actorId: string;
};

type DbOrTx = typeof db;

/** Record an operational event for a session. Use for analytics and audit. */
export async function recordSessionEvent(
  locationId: string,
  sessionId: string,
  type: SessionEventType,
  meta?: SessionEventMeta | Record<string, unknown>,
  actor?: SessionEventActor,
  dbOrTx: DbOrTx = db
): Promise<{ ok: boolean; error?: string }> {
  const location = await verifyLocationAccess(locationId);
  if (!location) {
    return { ok: false, error: "Unauthorized or location not found" };
  }

  const session = await dbOrTx.query.sessions.findFirst({
    where: eq(sessionsTable.id, sessionId),
    columns: { id: true, locationId: true },
  });
  if (!session || session.locationId !== locationId) {
    return { ok: false, error: "Session not found" };
  }

  await dbOrTx.insert(sessionEventsTable).values({
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

/**
 * Record a session event with a standardized source. Use to avoid repeating source logic at call sites.
 * Merges source (and optionally correlationId) into meta before calling recordSessionEvent.
 */
export async function recordSessionEventWithSource(
  locationId: string,
  sessionId: string,
  type: SessionEventType,
  source: EventSource,
  meta?: SessionEventMeta | Record<string, unknown>,
  actor?: SessionEventActor,
  correlationId?: string,
  dbOrTx: DbOrTx = db
): Promise<{ ok: boolean; error?: string }> {
  const merged = { source, ...meta } as Record<string, unknown>;
  if (correlationId != null) merged.correlationId = correlationId;
  return recordSessionEvent(locationId, sessionId, type, merged, actor, dbOrTx);
}
