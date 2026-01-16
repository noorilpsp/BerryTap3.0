import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import {
  orders,
  orderItems,
  orderItemCustomizations,
  orderTimeline,
  payments,
  orderDelivery,
  customers,
  tables,
  reservations,
} from "@/lib/db/schema/orders";
import { staff } from "@/lib/db/schema/staff";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/orders
 * List orders for a location with filters
 * Query params: locationId (required), status?, orderType?, date?, startDate?, endDate?
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");
    const orderType = searchParams.get("orderType");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Verify location exists and user has access
    const location = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: {
        id: true,
        merchantId: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
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

    // Build where conditions
    const whereConditions = [eq(orders.locationId, locationId)];
    if (status) {
      whereConditions.push(eq(orders.status, status as any));
    }
    if (orderType) {
      whereConditions.push(eq(orders.orderType, orderType as any));
    }
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      whereConditions.push(gte(orders.createdAt, dateStart));
      whereConditions.push(lte(orders.createdAt, dateEnd));
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.push(gte(orders.createdAt, start));
      whereConditions.push(lte(orders.createdAt, end));
    }

    // Fetch orders with relations
    const ordersList = await db.query.orders.findMany({
      where: and(...whereConditions),
      orderBy: [desc(orders.createdAt)],
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
          },
        },
        table: {
          columns: {
            id: true,
            tableNumber: true,
          },
        },
        assignedStaff: {
          columns: {
            id: true,
            fullName: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            notes: true,
          },
        },
      },
      limit: 100, // Limit to prevent huge responses
    });

    // Transform to match expected format
    const transformedOrders = ordersList.map((order) => {
      // Check if any items have notes
      const hasItemNotes = order.orderItems?.some((item) => item.notes && item.notes.trim().length > 0) || false;
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        table: order.table
          ? { id: order.table.id, tableNumber: order.table.tableNumber }
          : null,
        customer: order.customer
          ? { id: order.customer.id, name: order.customer.name || "Guest" }
          : null,
        itemsCount: order.orderItems?.length || 0,
        total: parseFloat(order.total || "0"),
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        assignedStaff: order.assignedStaff
          ? { id: order.assignedStaff.id, fullName: order.assignedStaff.fullName }
          : null,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        hasItemNotes,
      };
    });

    return NextResponse.json(
      { orders: transformedOrders },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create order with items and customizations
 * Body: { locationId, customerId?, tableId?, reservationId?, assignedStaffId?, orderType, paymentTiming, items: [{ itemId, quantity, customizations: [{ groupId, optionId, quantity }], notes? }], notes? }
 */
export async function POST(request: NextRequest) {
  try {
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
    const {
      locationId,
      customerId,
      tableId,
      reservationId,
      assignedStaffId,
      orderType,
      paymentTiming,
      items,
      notes,
    } = body;

    if (!locationId || !orderType || !paymentTiming || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Location ID, order type, payment timing, and at least one item are required" },
        { status: 400 }
      );
    }

    // Verify location exists and user has access
    const location = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: {
        id: true,
        merchantId: true,
        taxRate: true,
        serviceChargePercentage: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
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

    // Generate order number (ORD-001 format, incrementing per location per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.locationId, locationId),
        gte(orders.createdAt, today),
        lte(orders.createdAt, tomorrow)
      ),
      columns: {
        orderNumber: true,
      },
    });

    const orderNumber = `ORD-${String(todayOrders.length + 1).padStart(3, "0")}`;

    // Fetch items to get current prices
    const { items: menuItems } = await import("@/lib/db/schema/menus");
    const itemIds = items.map((item: any) => item.itemId).filter(Boolean);
    const menuItemsData = itemIds.length > 0
      ? await db.query.items.findMany({
          where: and(
            eq(menuItems.locationId, locationId),
            sql`${menuItems.id} = ANY(${itemIds})`
          ),
        })
      : [];

    const itemMap = new Map(menuItemsData.map((item) => [item.id, item]));

    // Calculate totals
    let subtotal = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of items) {
      const menuItem = item.itemId ? itemMap.get(item.itemId) : null;
      const itemName = menuItem?.name || item.itemName || "Unknown Item";
      const itemPrice = menuItem ? parseFloat(menuItem.price) : parseFloat(item.itemPrice || "0");
      const quantity = item.quantity || 1;

      // Calculate customizations total
      let customizationsTotal = 0;
      const customizationsToCreate: any[] = [];

      if (item.customizations && Array.isArray(item.customizations)) {
        for (const cust of item.customizations) {
          const { customizationOptions } = await import("@/lib/db/schema/menus");
          const option = cust.optionId
            ? await db.query.customizationOptions.findFirst({
                where: eq(customizationOptions.id, cust.optionId),
              })
            : null;

          const optionPrice = option ? parseFloat(option.price) : parseFloat(cust.optionPrice || "0");
          const custQuantity = cust.quantity || 1;
          customizationsTotal += optionPrice * custQuantity;

          if (option) {
            const { customizationGroups } = await import("@/lib/db/schema/menus");
            const group = await db.query.customizationGroups.findFirst({
              where: eq(customizationGroups.id, option.groupId),
            });

            customizationsToCreate.push({
              groupId: option.groupId,
              optionId: option.id,
              groupName: group?.name || cust.groupName || "Customization",
              optionName: option.name,
              optionPrice: option.price,
              quantity: custQuantity,
            });
          }
        }
      }

      const lineTotal = (itemPrice * quantity) + customizationsTotal;
      subtotal += lineTotal;

      orderItemsToCreate.push({
        itemId: item.itemId || null,
        itemName,
        itemPrice: itemPrice.toString(),
        quantity,
        customizationsTotal: customizationsTotal.toString(),
        lineTotal: lineTotal.toString(),
        notes: item.notes || null,
        customizations: customizationsToCreate,
      });
    }

    // Calculate tax and service charge (using location defaults)
    const taxRate = parseFloat(location.taxRate || "21.00") / 100;
    const serviceChargeRate = parseFloat(location.serviceChargePercentage || "0.00") / 100;
    const taxAmount = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const total = subtotal + taxAmount + serviceCharge;

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        locationId,
        customerId: customerId || null,
        tableId: tableId || null,
        reservationId: reservationId || null,
        assignedStaffId: assignedStaffId || null,
        orderNumber,
        orderType: orderType as any,
        paymentTiming: paymentTiming as any,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        serviceCharge: serviceCharge.toString(),
        total: total.toString(),
        notes: notes || null,
      })
      .returning();

    // Create order items and customizations
    for (const itemData of orderItemsToCreate) {
      const { customizations, ...itemInsert } = itemData;
      const [orderItem] = await db
        .insert(orderItems)
        .values({
          orderId: newOrder.id,
          ...itemInsert,
        })
        .returning();

      // Create customizations
      if (customizations && customizations.length > 0) {
        await db.insert(orderItemCustomizations).values(
          customizations.map((cust: any) => ({
            orderItemId: orderItem.id,
            ...cust,
          }))
        );
      }
    }

    // Create initial timeline entry
    await db.insert(orderTimeline).values({
      orderId: newOrder.id,
      status: "pending",
      changedByUserId: user.id,
      note: "Order created",
    });

    // Update table status if table is assigned
    if (tableId) {
      await db
        .update(tables)
        .set({ status: "occupied", updatedAt: new Date() })
        .where(eq(tables.id, tableId));
    }

    // Fetch complete order with all relations
    const completeOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        customer: true,
        table: true,
        reservation: true,
        assignedStaff: true,
        orderItems: {
          with: {
            customizations: true,
          },
        },
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
        },
        payments: true,
        delivery: true,
      },
    });

    return NextResponse.json({ order: completeOrder }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create order",
      },
      { status: 500 }
    );
  }
}
