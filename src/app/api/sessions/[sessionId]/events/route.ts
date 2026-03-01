import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { recordEventWithSource } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import type { SessionEventType } from "@/app/actions/session-events";

export const runtime = "nodejs";

function normalizeEventSource(value: unknown): "table_page" | "kds" | "system" | "api" {
  return value === "table_page" || value === "kds" || value === "system" ? value : "api";
}

/**
 * POST /api/sessions/[sessionId]/events
 * Body: { type: string, payload?: unknown, eventSource: "table_page"|"kds"|"system"|"api" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  let idemKey: string | undefined;
  try {
    const idem = requireIdempotencyKey(request);
    if (!idem.ok) return idem.failure;
    idemKey = idem.key;

    const supabase = await supabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idemKey });
    }

    const { sessionId } = await params;
    if (!sessionId || !sessionId.trim()) {
      return posFailure("BAD_REQUEST", "sessionId is required", { status: 400, correlationId: idemKey });
    }

    const body = await request.json().catch(() => ({}));
    const type = body.type;
    if (!type || typeof type !== "string" || !type.trim()) {
      return posFailure("BAD_REQUEST", "type is required", { status: 400, correlationId: idemKey });
    }
    const eventSource = normalizeEventSource(body.eventSource ?? "api");
    const payload = body.payload;

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId.trim()),
      columns: { id: true, locationId: true },
      with: { location: { columns: { merchantId: true } } },
    });
    if (!session?.location) {
      return posFailure("NOT_FOUND", "Session not found", { status: 404, correlationId: idemKey });
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, session.location!.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });
    if (!membership) {
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403, correlationId: idemKey });
    }

    const meta =
      payload != null && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : payload != null
          ? { value: payload }
          : {};
    const result = await recordEventWithSource(
      session.locationId,
      sessionId.trim(),
      type.trim() as SessionEventType,
      eventSource,
      meta,
      undefined,
      idemKey
    );

    if (!result.ok) {
      return posFailure(
        "BAD_REQUEST",
        result.error ?? "Failed to record event",
        { status: 400, correlationId: idemKey }
      );
    }

    return posSuccess({ ok: true }, { correlationId: idemKey });
  } catch (error) {
    console.error("[POST /api/sessions/.../events] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to record event"),
      { status: 500, correlationId: idemKey }
    );
  }
}
