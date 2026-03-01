import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { orderItems, orders } from "@/lib/db/schema/orders";
import { refireItem } from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/items/[itemId]/refire
 * Refire an existing order item.
 * Body: { reason }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" && body.reason.trim().length > 0
        ? body.reason.trim()
        : "Refired via API";

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { location: { columns: { merchantId: true } } },
      columns: { id: true },
    });
    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404 });
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
      });
    }

    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404 });
    }

    const result = await refireItem(itemId, reason, { eventSource: "api" });
    if (!result.ok) {
      return posFailure("BAD_REQUEST", result.reason ?? "refire_failed", { status: 400 });
    }

    return posSuccess({ success: true });
  } catch (error) {
    console.error("[POST /api/orders/[id]/items/[itemId]/refire] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to refire order item"),
      { status: 500 }
    );
  }
}
