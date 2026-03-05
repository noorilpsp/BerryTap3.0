import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { devTimer, devSqlLog, devTimeStart, devTimeEnd, runExplain, DEV } from "@/lib/pos/devTimer";
import { fireWave } from "@/domain";
import type { EventSource } from "@/app/actions/session-events";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

function normalizeEventSource(value: unknown): EventSource {
  return value === "table_page" || value === "kds" || value === "system"
    ? value
    : "api";
}

/**
 * POST /api/sessions/[sessionId]/waves/[waveNumber]/fire
 * Body: { eventSource? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; waveNumber: string }> }
) {
  const ROUTE = "POST /api/sessions/[sessionId]/waves/[waveNumber]/fire";
  const totalStart = DEV ? performance.now() : 0;
  const explainMode = DEV && new URL(request.url).searchParams.get("explain") === "1";
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { sessionId, waveNumber } = await params;
    const parsedWaveNumber = Number.parseInt(waveNumber, 10);
    if (!Number.isFinite(parsedWaveNumber) || parsedWaveNumber <= 0) {
      return posFailure("BAD_REQUEST", "Invalid waveNumber", { status: 400, correlationId: idempotencyKey });
    }

    devTimeStart("POST fire auth");
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    devTimeEnd("POST fire auth");
    if (DEV) devTimer("POST fire auth", totalStart);

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const body = await request.json().catch(() => ({}));
    const eventSource = normalizeEventSource(body.eventSource);

    const requestHash = computeRequestHash({ ...body, sessionId, waveNumber: parsedWaveNumber });
    const t1 = DEV ? performance.now() : 0;
    devTimeStart("POST fire getIdempotentResponse");
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE,
      requestHash,
    });
    devTimeEnd("POST fire getIdempotentResponse", cached ? 1 : 0);
    if (DEV) devTimer("POST fire getIdempotentResponse", t1, cached ? 1 : 0);
    if (cached) {
      if (!cached.ok) {
        return posFailure(IDEMPOTENCY_CONFLICT, "Idempotency-Key reuse with different request", {
          status: 409,
          correlationId: idempotencyKey,
        });
      }
      const saved = cached.response as { body: Record<string, unknown>; status: number };
      const replayBody = { ...(saved.body ?? cached.response) as Record<string, unknown>, correlationId: idempotencyKey };
      return NextResponse.json(replayBody, { status: saved.status ?? 200 });
    }

    const t2 = DEV ? performance.now() : 0;
    devTimeStart("POST fire sessions.findFirst");
    const existingSession = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
      columns: {
        id: true,
      },
    });
    devTimeEnd("POST fire sessions.findFirst", existingSession ? 1 : 0);
    if (DEV) devTimer("POST fire sessions.findFirst", t2, existingSession ? 1 : 0);

    const sessionsSelectSql = db.select().from(sessions).where(eq(sessions.id, sessionId));
    const { sql: sessionsSql, params: sessionsParams } = sessionsSelectSql.toSQL();
    if (DEV) devSqlLog("POST fire", "sessions.findFirst", sessionsSql, sessionsParams);

    if (!existingSession?.location) {
      return posFailure("NOT_FOUND", "Session not found", { status: 404, correlationId: idempotencyKey });
    }

    const t3 = DEV ? performance.now() : 0;
    devTimeStart("POST fire merchantUsers.findFirst");
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingSession.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });
    devTimeEnd("POST fire merchantUsers.findFirst", membership ? 1 : 0);
    if (DEV) devTimer("POST fire merchantUsers.findFirst", t3, membership ? 1 : 0);

    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    const t4 = DEV ? performance.now() : 0;
    devTimeStart("POST fire fireWave");
    const result = await fireWave(sessionId, {
      waveNumber: parsedWaveNumber,
      eventSource,
    });
    devTimeEnd("POST fire fireWave");
    if (DEV) devTimer("POST fire fireWave", t4);

    if (!result.ok) {
      const statusCode =
        result.reason === "session_not_found" || result.reason === "order_not_found"
          ? 404
          : result.reason === "unauthorized"
            ? 403
            : result.reason === "wave_already_fired" || result.reason === "no_wave_to_fire"
              ? 409
              : 400;
      const code =
        statusCode === 404
          ? "NOT_FOUND"
          : statusCode === 403
            ? "FORBIDDEN"
            : statusCode === 409
              ? "CONFLICT"
              : "BAD_REQUEST";
      const failureBody = { ok: false as const, error: { code, message: result.reason }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE,
        requestHash,
        responseJson: { body: failureBody, status: statusCode },
      });
      return posFailure(code, result.reason, { status: statusCode, correlationId: idempotencyKey });
    }

    const successBody = {
      ok: true as const,
      data: {
        waveNumber: result.wave,
        status: "sent" as const,
        affectedItemIds: result.affectedItems ?? [],
      },
      correlationId: idempotencyKey,
    };
    devTimeStart("POST fire saveIdempotentResponse");
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    devTimeEnd("POST fire saveIdempotentResponse", 1);
    if (DEV) devTimer("POST fire total", totalStart);

    let meta: { explain?: string } | undefined;
    if (explainMode) {
      meta = { explain: await runExplain(sessionsSql, sessionsParams) };
    }
    return posSuccess(successBody.data, { correlationId: idempotencyKey, meta });
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/waves/[waveNumber]/fire] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to fire wave"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
