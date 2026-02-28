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
} from "@/domain/serviceActions";

export const runtime = "nodejs";

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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { quantity, notes, status } = body;

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
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    // Route status changes through service layer (validate transitions, record events)
    if (status !== undefined) {
      if (status === "preparing") {
        const result = await markItemPreparing(itemId);
        if (!result.ok) {
          return NextResponse.json({ error: result.reason }, { status: 400 });
        }
      } else if (status === "ready") {
        const result = await markItemReady(itemId, { eventSource: "api" });
        if (!result.ok) {
          return NextResponse.json({ error: result.reason }, { status: 400 });
        }
      } else if (status === "served") {
        const result = await serveItem(itemId, { eventSource: "api" });
        if (!result.ok) {
          return NextResponse.json({ error: result.reason }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: `Invalid status: ${status}. Use preparing, ready, or served.` },
          { status: 400 }
        );
      }
    }

    // Route quantity/notes through service layer (validate, update, recalculate totals)
    if (quantity !== undefined) {
      const result = await updateItemQuantity(itemId, quantity);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason === "item_sent_to_kitchen" ? "Cannot modify order items that have been sent to kitchen" : result.reason },
          { status: 400 }
        );
      }
    }
    if (notes !== undefined) {
      const result = await updateItemNotes(itemId, notes);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason === "item_sent_to_kitchen" ? "Cannot modify order items that have been sent to kitchen" : result.reason },
          { status: 400 }
        );
      }
    }

    const updatedItem = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[PUT /api/orders/[id]/items/[itemId]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update order item",
      },
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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    // Verify item belongs to this order
    const itemInOrder = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.id, itemId)),
      columns: { id: true },
    });
    if (!itemInOrder) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    const result = await voidItem(itemId, "Removed via API", { eventSource: "api" });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason === "item_already_voided" ? "Order item already voided" : result.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/orders/[id]/items/[itemId]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to remove item from order",
      },
      { status: 500 }
    );
  }
}
