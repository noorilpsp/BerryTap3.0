import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { payments } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import { updatePayment } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

const ROUTE = "PUT /api/payments/[id]";

/**
 * PUT /api/payments/[id]
 * Update payment status (complete, refund)
 * Body: { status, refundedAt? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status) {
      return posFailure("BAD_REQUEST", "Status is required", { status: 400, correlationId: idempotencyKey });
    }

    const requestHash = computeRequestHash({ ...body, id });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE,
      requestHash,
    });
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

    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
      with: { order: { with: { location: { columns: { merchantId: true } } } } },
    });

    if (!existingPayment?.order?.location) {
      return posFailure("NOT_FOUND", "Payment not found", { status: 404, correlationId: idempotencyKey });
    }

    const merchantId = existingPayment.order.location.merchantId;
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });

    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    const result = await updatePayment(id, status);

    if (!result.ok) {
      const statusCode = result.reason === "unauthorized" ? 403 : 400;
      const code = statusCode === 403 ? "FORBIDDEN" : "BAD_REQUEST";
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

    const updatedPayment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
    });
    const data = updatedPayment ?? { id };
    const successBody = { ok: true as const, data, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[PUT /api/payments/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update payment"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
