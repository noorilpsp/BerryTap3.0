import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { addItemToExistingOrder } from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/items
 * Add item to existing order
 * Body: { itemId, quantity, customizations?: [{ groupId, optionId, quantity }], notes? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { itemId, quantity, customizations, notes } = body;

    if (!itemId || !quantity) {
      return posFailure("BAD_REQUEST", "Item ID and quantity are required", { status: 400 });
    }

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { location: { columns: { merchantId: true } } },
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

    const result = await addItemToExistingOrder(id, {
      itemId,
      quantity: Number(quantity),
      notes: notes ?? undefined,
      customizations: Array.isArray(customizations)
        ? customizations.map((c: { groupId?: string; optionId?: string; quantity?: number }) => ({
            groupId: c.groupId,
            optionId: c.optionId,
            quantity: c.quantity,
          }))
        : undefined,
    });

    if (!result.ok) {
      const status = result.reason === "unauthorized" ? 403 : result.reason === "item_not_found" ? 404 : 400;
      const code = status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "BAD_REQUEST";
      return posFailure(code, result.reason, { status });
    }

    const newOrderItem = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, result.orderItemId),
    });
    return posSuccess(newOrderItem ?? { id: result.orderItemId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders/[id]/items] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to add item to order"),
      { status: 500 }
    );
  }
}
