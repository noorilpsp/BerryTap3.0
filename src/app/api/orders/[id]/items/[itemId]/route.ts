import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

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

    // Update order item
    const updateData: Record<string, unknown> = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) {
      updateData.status = status;
      const now = new Date();
      if (status === "preparing") updateData.startedAt = now;
      if (status === "ready") updateData.readyAt = now;
      if (status === "served") updateData.servedAt = now;
    }

    // Recalculate line total if quantity changed
    if (quantity !== undefined) {
      const orderItem = await db.query.orderItems.findFirst({
        where: and(
          eq(orderItems.orderId, id),
          eq(orderItems.id, itemId)
        ),
      });

      if (orderItem) {
        const itemPrice = parseFloat(orderItem.itemPrice);
        const customizationsTotal = parseFloat(orderItem.customizationsTotal);
        updateData.lineTotal = ((itemPrice * quantity) + customizationsTotal).toString();
      }
    }

    const [updatedItem] = await db
      .update(orderItems)
      .set(updateData)
      .where(and(
        eq(orderItems.orderId, id),
        eq(orderItems.id, itemId)
      ))
      .returning();

    // Recalculate order totals
    const allItems = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    const newSubtotal = allItems.reduce((sum, item) => sum + parseFloat(item.lineTotal), 0);
    const taxRate = parseFloat(existingOrder.location.taxRate || "21.00") / 100;
    const serviceChargeRate = parseFloat(existingOrder.location.serviceChargePercentage || "0.00") / 100;
    const taxAmount = newSubtotal * taxRate;
    const serviceCharge = newSubtotal * serviceChargeRate;
    const newTotal = newSubtotal + taxAmount + serviceCharge + parseFloat(existingOrder.tipAmount) - parseFloat(existingOrder.discountAmount);

    await db
      .update(orders)
      .set({
        subtotal: newSubtotal.toString(),
        taxAmount: taxAmount.toString(),
        serviceCharge: serviceCharge.toString(),
        total: newTotal.toString(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

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

    // Delete order item (cascade will handle customizations)
    await db.delete(orderItems).where(and(
      eq(orderItems.orderId, id),
      eq(orderItems.id, itemId)
    ));

    // Recalculate order totals
    const allItems = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    const newSubtotal = allItems.reduce((sum, item) => sum + parseFloat(item.lineTotal), 0);
    const taxRate = parseFloat(existingOrder.location.taxRate || "21.00") / 100;
    const serviceChargeRate = parseFloat(existingOrder.location.serviceChargePercentage || "0.00") / 100;
    const taxAmount = newSubtotal * taxRate;
    const serviceCharge = newSubtotal * serviceChargeRate;
    const newTotal = newSubtotal + taxAmount + serviceCharge + parseFloat(existingOrder.tipAmount) - parseFloat(existingOrder.discountAmount);

    await db
      .update(orders)
      .set({
        subtotal: newSubtotal.toString(),
        taxAmount: taxAmount.toString(),
        serviceCharge: serviceCharge.toString(),
        total: newTotal.toString(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

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
