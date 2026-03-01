import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { orderItems, orders } from "@/lib/db/schema/orders";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import { refireItem } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/items/[itemId]/refire
 * Refire an existing order item.
 * Body: { reason }
 */
const ROUTE = "POST /api/orders/[id]/items/[itemId]/refire";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { id, itemId } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" && body.reason.trim().length > 0
        ? body.reason.trim()
        : "Refired via API";

    const requestHash = computeRequestHash({ ...body, id, itemId });
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

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { location: { columns: { merchantId: true } } },
      columns: { id: true },
    });
    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404, correlationId: idempotencyKey });
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
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

    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404, correlationId: idempotencyKey });
    }

    const result = await refireItem(itemId, reason, { eventSource: "api" });
    if (!result.ok) {
      const msg = result.reason ?? "refire_failed";
      const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: msg }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE,
        requestHash,
        responseJson: { body: failureBody, status: 400 },
      });
      return posFailure("BAD_REQUEST", msg, { status: 400, correlationId: idempotencyKey });
    }

    const successBody = { ok: true as const, data: { success: true }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(successBody.data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[POST /api/orders/[id]/items/[itemId]/refire] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to refire order item"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
