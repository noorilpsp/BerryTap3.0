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
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

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
export async function PUT(
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
    const { quantity, notes, status, eventSource } = body;
    const source = normalizeEventSource(eventSource);

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
      });
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404 });
    }

    // Route status changes through service layer (validate transitions, record events)
    if (status !== undefined) {
      if (status === "preparing") {
        const result = await markItemPreparing(itemId);
        if (!result.ok) {
          return posFailure("BAD_REQUEST", result.reason, { status: 400 });
        }
      } else if (status === "ready") {
        const result = await markItemReady(itemId, { eventSource: source });
        if (!result.ok) {
          return posFailure("BAD_REQUEST", result.reason, { status: 400 });
        }
      } else if (status === "served") {
        const result = await serveItem(itemId, { eventSource: source });
        if (!result.ok) {
          return posFailure("BAD_REQUEST", result.reason, { status: 400 });
        }
      } else {
        return posFailure(
          "BAD_REQUEST",
          `Invalid status: ${status}. Use preparing, ready, or served.`,
          { status: 400 }
        );
      }
    }

    // Route quantity/notes through service layer (validate, update, recalculate totals)
    if (quantity !== undefined) {
      const result = await updateItemQuantity(itemId, quantity);
      if (!result.ok) {
        return posFailure(
          "BAD_REQUEST",
          result.reason === "item_sent_to_kitchen"
            ? "Cannot modify order items that have been sent to kitchen"
            : result.reason,
          { status: 400 }
        );
      }
    }
    if (notes !== undefined) {
      const result = await updateItemNotes(itemId, notes);
      if (!result.ok) {
        return posFailure(
          "BAD_REQUEST",
          result.reason === "item_sent_to_kitchen"
            ? "Cannot modify order items that have been sent to kitchen"
            : result.reason,
          { status: 400 }
        );
      }
    }

    const updatedItem = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
    });

    return posSuccess(updatedItem ?? { id: itemId });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/items/[itemId]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update order item"),
      { status: 500 }
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
        ? body.reason
        : "Removed via API";
    const source = normalizeEventSource(body.eventSource);

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
      });
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return posFailure("NOT_FOUND", "Order item not found", { status: 404 });
    }

    const result = await voidItem(itemId, reason, { eventSource: source });
    if (!result.ok) {
      return posFailure(
        "BAD_REQUEST",
        result.reason === "item_already_voided" ? "Order item already voided" : result.reason,
        { status: 400 }
      );
    }

    return posSuccess({ success: true });
  } catch (error) {
    console.error("[DELETE /api/orders/[id]/items/[itemId]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to remove item from order"),
      { status: 500 }
    );
  }
}
