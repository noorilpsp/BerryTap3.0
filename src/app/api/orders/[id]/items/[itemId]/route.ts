import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import {
  markItemPreparing,
  markItemReady,
  serveItem,
  updateItemQuantity,
  updateItemNotes,
  voidItem,
} from "@/domain";
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
 * PUT /api/orders/[id]/items/[itemId]
 * Update order item
 */
const ROUTE_PUT = "PUT /api/orders/[id]/items/[itemId]";
const ROUTE_DELETE = "DELETE /api/orders/[id]/items/[itemId]";

export async function PUT(
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
    const { quantity, notes, status, eventSource } = body;
    const source = normalizeEventSource(eventSource);

    const requestHash = computeRequestHash({ ...body, id, itemId });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_PUT,
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

    // Get existing order
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
            taxRate: true,
            serviceChargePercentage: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404 });
    }

    // Check user has access
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    });

    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404, correlationId: idempotencyKey });
    }

    // Route status changes through service layer (validate transitions, record events)
    if (status !== undefined) {
      if (status === "preparing") {
        const result = await markItemPreparing(itemId);
        if (!result.ok) {
          const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: result.reason }, correlationId: idempotencyKey };
          await saveIdempotentResponse({
            key: idempotencyKey,
            userId: user.id,
            route: ROUTE_PUT,
            requestHash,
            responseJson: { body: failureBody, status: 400 },
          });
          return posFailure("BAD_REQUEST", result.reason, { status: 400, correlationId: idempotencyKey });
        }
      } else if (status === "ready") {
        const result = await markItemReady(itemId, { eventSource: source });
        if (!result.ok) {
          const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: result.reason }, correlationId: idempotencyKey };
          await saveIdempotentResponse({
            key: idempotencyKey,
            userId: user.id,
            route: ROUTE_PUT,
            requestHash,
            responseJson: { body: failureBody, status: 400 },
          });
          return posFailure("BAD_REQUEST", result.reason, { status: 400, correlationId: idempotencyKey });
        }
      } else if (status === "served") {
        const result = await serveItem(itemId, { eventSource: source });
        if (!result.ok) {
          const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: result.reason }, correlationId: idempotencyKey };
          await saveIdempotentResponse({
            key: idempotencyKey,
            userId: user.id,
            route: ROUTE_PUT,
            requestHash,
            responseJson: { body: failureBody, status: 400 },
          });
          return posFailure("BAD_REQUEST", result.reason, { status: 400, correlationId: idempotencyKey });
        }
      } else {
        const failureBody = {
          ok: false as const,
          error: { code: "BAD_REQUEST", message: `Invalid status: ${status}. Use preparing, ready, or served.` },
          correlationId: idempotencyKey,
        };
        await saveIdempotentResponse({
          key: idempotencyKey,
          userId: user.id,
          route: ROUTE_PUT,
          requestHash,
          responseJson: { body: failureBody, status: 400 },
        });
        return posFailure(
          "BAD_REQUEST",
          `Invalid status: ${status}. Use preparing, ready, or served.`,
          { status: 400, correlationId: idempotencyKey }
        );
      }
    }

    // Route quantity/notes through service layer (validate, update, recalculate totals)
    if (quantity !== undefined) {
      const result = await updateItemQuantity(itemId, quantity);
      if (!result.ok) {
        const msg = result.reason === "item_sent_to_kitchen"
          ? "Cannot modify order items that have been sent to kitchen"
          : result.reason;
        const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: msg }, correlationId: idempotencyKey };
        await saveIdempotentResponse({
          key: idempotencyKey,
          userId: user.id,
          route: ROUTE_PUT,
          requestHash,
          responseJson: { body: failureBody, status: 400 },
        });
        return posFailure("BAD_REQUEST", msg, { status: 400, correlationId: idempotencyKey });
      }
    }
    if (notes !== undefined) {
      const result = await updateItemNotes(itemId, notes);
      if (!result.ok) {
        const msg = result.reason === "item_sent_to_kitchen"
          ? "Cannot modify order items that have been sent to kitchen"
          : result.reason;
        const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: msg }, correlationId: idempotencyKey };
        await saveIdempotentResponse({
          key: idempotencyKey,
          userId: user.id,
          route: ROUTE_PUT,
          requestHash,
          responseJson: { body: failureBody, status: 400 },
        });
        return posFailure("BAD_REQUEST", msg, { status: 400, correlationId: idempotencyKey });
      }
    }

    const updatedItem = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
    });
    const successBody = { ok: true as const, data: updatedItem ?? { id: itemId }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_PUT,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(successBody.data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/items/[itemId]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update order item"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}

/**
 * DELETE /api/orders/[id]/items/[itemId]
 * Remove item from order
 */
export async function DELETE(
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
        ? body.reason
        : "Removed via API";
    const source = normalizeEventSource(body.eventSource);

    const requestHash = computeRequestHash({ ...body, id, itemId });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_DELETE,
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

    // Get existing order
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404, correlationId: idempotencyKey });
    }

    // Check user has access
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    });

    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404, correlationId: idempotencyKey });
    }

    const result = await voidItem(itemId, reason, { eventSource: source });
    if (!result.ok) {
      const msg = result.reason === "item_already_voided" ? "Order item already voided" : result.reason;
      const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: msg }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE_DELETE,
        requestHash,
        responseJson: { body: failureBody, status: 400 },
      });
      return posFailure("BAD_REQUEST", msg, { status: 400, correlationId: idempotencyKey });
    }

    const successBody = { ok: true as const, data: { success: true }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_DELETE,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(successBody.data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[DELETE /api/orders/[id]/items/[itemId]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to remove item from order"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
