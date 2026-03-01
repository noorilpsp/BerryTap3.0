import {
  recordSessionEvent,
  recordSessionEventWithSource,
  type EventSource,
  type SessionActorType,
  type SessionEventMeta,
  type SessionEventType,
} from "@/app/actions/session-events";

export type { EventSource, SessionActorType, SessionEventMeta, SessionEventType };

export type SessionEventActor = {
  actorType: SessionActorType;
  actorId: string;
};

/**
 * Raw event writer. Preserves existing behavior where callers intentionally omit source metadata.
 */
export async function recordEventRaw(
  locationId: string,
  sessionId: string,
  type: SessionEventType,
  meta?: SessionEventMeta | Record<string, unknown>,
  actor?: SessionEventActor
): Promise<{ ok: boolean; error?: string }> {
  return recordSessionEvent(locationId, sessionId, type, meta, actor);
}

/**
 * Event writer with standardized source and optional correlation id.
 */
export async function recordEventWithSource(
  locationId: string,
  sessionId: string,
  type: SessionEventType,
  source: EventSource,
  meta?: SessionEventMeta | Record<string, unknown>,
  actor?: SessionEventActor,
  correlationId?: string
): Promise<{ ok: boolean; error?: string }> {
  return recordSessionEventWithSource(
    locationId,
    sessionId,
    type,
    source,
    meta,
    actor,
    correlationId
  );
}
