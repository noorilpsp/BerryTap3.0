import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderItems, orderItemCustomizations } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { items } from "@/lib/db/schema/menus";

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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { itemId, quantity, customizations, notes } = body;

    if (!itemId || !quantity) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
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

    // Check user has access to this merchant
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

    // Fetch item to get current price
    const menuItem = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const itemPrice = parseFloat(menuItem.price);
    const itemQuantity = quantity;

    // Calculate customizations total
    let customizationsTotal = 0;
    const customizationsToCreate: any[] = [];

    if (customizations && Array.isArray(customizations)) {
      const { customizationOptions, customizationGroups } = await import("@/lib/db/schema/menus");
      for (const cust of customizations) {
        const option = cust.optionId
          ? await db.query.customizationOptions.findFirst({
              where: eq(customizationOptions.id, cust.optionId),
            })
          : null;

        if (option) {
          const optionPrice = parseFloat(option.price);
          const custQuantity = cust.quantity || 1;
          customizationsTotal += optionPrice * custQuantity;

          const group = await db.query.customizationGroups.findFirst({
            where: eq(customizationGroups.id, option.groupId),
          });

          customizationsToCreate.push({
            groupId: option.groupId,
            optionId: option.id,
            groupName: group?.name || "Customization",
            optionName: option.name,
            optionPrice: option.price,
            quantity: custQuantity,
          });
        }
      }
    }

    const lineTotal = (itemPrice * itemQuantity) + customizationsTotal;

    // Create order item
    const [newOrderItem] = await db
      .insert(orderItems)
      .values({
        orderId: id,
        itemId,
        itemName: menuItem.name,
        itemPrice: itemPrice.toString(),
        quantity: itemQuantity,
        customizationsTotal: customizationsTotal.toString(),
        lineTotal: lineTotal.toString(),
        notes: notes || null,
      })
      .returning();

    // Create customizations
    if (customizationsToCreate.length > 0) {
      await db.insert(orderItemCustomizations).values(
        customizationsToCreate.map((cust) => ({
          orderItemId: newOrderItem.id,
          ...cust,
        }))
      );
    }

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

    // Update order totals
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

    return NextResponse.json(newOrderItem, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders/[id]/items] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to add item to order",
      },
      { status: 500 }
    );
  }
}
