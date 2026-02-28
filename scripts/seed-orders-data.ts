/**
 * Seed script to add sample orders data to the database
 * Run with: npm run seed:orders or tsx scripts/seed-orders-data.ts
 */

import { loadEnvConfig } from "@next/env";
import { db } from "../src/db";
import { eq, and, sql } from "drizzle-orm";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import {
  tables,
  customers,
  reservations,
  orders,
  orderItems,
  orderItemCustomizations,
  orderTimeline,
  payments,
} from "../src/lib/db/schema/orders";
import { merchantLocations } from "../src/lib/db/schema/merchant-locations";
import { staff } from "../src/lib/db/schema/staff";
import { items, customizationGroups, customizationOptions } from "../src/lib/db/schema/menus";

async function seedOrdersData() {
  console.log("🌱 Starting orders data seed...\n");

  try {
    // Step 1: Get or use first available location
    console.log("📍 Step 1: Finding location...");
    const locations = await db.query.merchantLocations.findMany({
      limit: 1,
    });

    if (locations.length === 0) {
      console.error("❌ No locations found. Please create a location first.");
      console.log("   You can create a location through the dashboard at /dashboard/stores");
      process.exit(1);
    }

    const location = locations[0];
    console.log(`   ✅ Using location: ${location.name} (${location.id})\n`);

    // Step 2: Get menu items
    console.log("🍽️  Step 2: Finding menu items...");
    const menuItems = await db.query.items.findMany({
      where: eq(items.locationId, location.id),
      limit: 10,
    });

    if (menuItems.length === 0) {
      console.error("❌ No menu items found. Please seed menu data first.");
      console.log("   Run: npm run seed:menu");
      process.exit(1);
    }

    console.log(`   ✅ Found ${menuItems.length} menu items\n`);

    // Step 3: Get customization groups and options
    console.log("⚙️  Step 3: Finding customization options...");
    const customizationGroupsList = await db.query.customizationGroups.findMany({
      where: eq(customizationGroups.locationId, location.id),
      with: {
        options: true,
      },
      limit: 5,
    });

    const allCustomizationOptions: typeof customizationOptions.$inferSelect[] = [];
    customizationGroupsList.forEach((group) => {
      allCustomizationOptions.push(...group.options);
    });

    console.log(`   ✅ Found ${customizationGroupsList.length} customization groups with ${allCustomizationOptions.length} options\n`);

    // Step 4: Get or create staff
    console.log("👥 Step 4: Finding staff...");
    let staffMembers = await db.query.staff.findMany({
      where: eq(staff.locationId, location.id),
      limit: 3,
    });

    if (staffMembers.length === 0) {
      console.log("   Creating sample staff members...");
      const seedStaffMembers: Array<typeof staff.$inferInsert> = [
        {
          locationId: location.id,
          fullName: "John Server",
          email: "john@example.com",
          phone: "+1234567890",
          pinCodeHash: "$2a$10$dummyhash", // Dummy hash for seeding
          role: "server",
          isActive: true,
          hiredAt: "2024-01-01T00:00:00.000Z",
        },
        {
          locationId: location.id,
          fullName: "Jane Manager",
          email: "jane@example.com",
          phone: "+1234567891",
          pinCodeHash: "$2a$10$dummyhash",
          role: "manager",
          isActive: true,
          hiredAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      staffMembers = await db
        .insert(staff)
        .values(seedStaffMembers)
        .returning();
    }

    console.log(`   ✅ Using ${staffMembers.length} staff members\n`);

    // Step 5: Create tables
    console.log("🪑 Step 5: Creating tables...");
    const existingTables = await db.query.tables.findMany({
      where: eq(tables.locationId, location.id),
      limit: 5,
    });

    let restaurantTables = existingTables;
    if (restaurantTables.length < 3) {
      const newTables = await db
        .insert(tables)
        .values([
          {
            locationId: location.id,
            tableNumber: "1",
            seats: 4,
            status: "available",
          },
          {
            locationId: location.id,
            tableNumber: "2",
            seats: 2,
            status: "available",
          },
          {
            locationId: location.id,
            tableNumber: "3",
            seats: 6,
            status: "available",
          },
          {
            locationId: location.id,
            tableNumber: "4",
            seats: 4,
            status: "available",
          },
          {
            locationId: location.id,
            tableNumber: "5",
            seats: 8,
            status: "available",
          },
        ])
        .returning();
      restaurantTables = [...existingTables, ...newTables];
    }

    console.log(`   ✅ Using ${restaurantTables.length} tables\n`);

    // Step 6: Create customers
    console.log("👤 Step 6: Creating customers...");
    const sampleCustomers = await db
      .insert(customers)
      .values([
        {
          locationId: location.id,
          name: "Alice Johnson",
          email: "alice@example.com",
          phone: "+1234567892",
        },
        {
          locationId: location.id,
          name: "Bob Smith",
          email: "bob@example.com",
          phone: "+1234567893",
        },
        {
          locationId: location.id,
          name: "Charlie Brown",
          email: "charlie@example.com",
          phone: "+1234567894",
        },
        {
          locationId: location.id,
          name: "Diana Prince",
          email: "diana@example.com",
          phone: "+1234567895",
        },
      ])
      .returning();

    console.log(`   ✅ Created ${sampleCustomers.length} customers\n`);

    // Step 7: Create orders with items and customizations
    console.log("📦 Step 7: Creating orders...");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // Helper function to generate order number
    const generateOrderNumber = async (locationId: string, date: string): Promise<string> => {
      // Count orders for this location on this date
      // Use CAST to convert timestamp to date for comparison
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(
          and(
            eq(orders.locationId, locationId),
            sql`${orders.createdAt} >= ${dateStart} AND ${orders.createdAt} <= ${dateEnd}`
          )
        );

      const count = result[0]?.count || 0;
      const orderNum = (count + 1).toString().padStart(4, "0");
      return `${date.replace(/-/g, "")}-${orderNum}`;
    };

    // Order 1: Dine-in order with table, multiple items, customizations
    const order1Number = await generateOrderNumber(location.id, todayStr);
    const order1 = await db
      .insert(orders)
      .values({
        locationId: location.id,
        customerId: sampleCustomers[0].id,
        tableId: restaurantTables[0].id,
        assignedStaffId: staffMembers[0].id,
        orderNumber: order1Number,
        orderType: "dine_in",
        status: "confirmed",
        paymentStatus: "unpaid",
        paymentTiming: "pay_later",
        subtotal: "45.98",
        taxAmount: "3.68",
        serviceCharge: "2.30",
        tipAmount: "0.00",
        discountAmount: "0.00",
        total: "51.96",
        notes: "Customer requested extra napkins",
      })
      .returning();

    // Update table status
    await db
      .update(tables)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(tables.id, restaurantTables[0].id));

    // Order 1 items
    const item1 = menuItems[0];
    const item1Price = parseFloat(item1.price);
    const customization1Price = allCustomizationOptions.length > 0 ? parseFloat(allCustomizationOptions[0].price) : 0;
    const line1Total = (item1Price + customization1Price) * 2; // quantity 2

    const order1Item1 = await db
      .insert(orderItems)
      .values({
        orderId: order1[0].id,
        itemId: item1.id,
        itemName: item1.name,
        itemPrice: item1.price,
        quantity: 2,
        customizationsTotal: (customization1Price * 2).toFixed(2),
        lineTotal: line1Total.toFixed(2),
        status: "preparing",
        notes: "Please make it extra crispy",
      })
      .returning();

    // Add customization to order item 1
    if (allCustomizationOptions.length > 0) {
      const option1 = allCustomizationOptions[0];
      const group1 = customizationGroupsList.find((g) =>
        g.options.some((o) => o.id === option1.id)
      );
      if (group1) {
        await db.insert(orderItemCustomizations).values({
          orderItemId: order1Item1[0].id,
          groupId: group1.id,
          optionId: option1.id,
          groupName: group1.name,
          optionName: option1.name,
          optionPrice: option1.price,
          quantity: 2,
        });
      }
    }

    const item2 = menuItems[1] || menuItems[0];
    const item2Price = parseFloat(item2.price);
    const order1Item2 = await db
      .insert(orderItems)
      .values({
        orderId: order1[0].id,
        itemId: item2.id,
        itemName: item2.name,
        itemPrice: item2.price,
        quantity: 1,
        customizationsTotal: "0.00",
        lineTotal: item2Price.toFixed(2),
        status: "pending",
        notes: "No onions, please",
      })
      .returning();

    // Order 1 timeline
    await db.insert(orderTimeline).values([
      {
        orderId: order1[0].id,
        status: "pending",
        changedByStaffId: staffMembers[0].id,
        note: "Order created",
      },
      {
        orderId: order1[0].id,
        status: "confirmed",
        changedByStaffId: staffMembers[0].id,
        note: "Order confirmed by server",
      },
    ]);

    // Order 2: Pickup order, paid
    const order2Number = await generateOrderNumber(location.id, todayStr);
    const order2 = await db
      .insert(orders)
      .values({
        locationId: location.id,
        customerId: sampleCustomers[1].id,
        assignedStaffId: staffMembers[0].id,
        orderNumber: order2Number,
        orderType: "pickup",
        status: "ready",
        paymentStatus: "paid",
        paymentTiming: "pay_first",
        subtotal: "28.99",
        taxAmount: "2.32",
        serviceCharge: "0.00",
        tipAmount: "5.00",
        discountAmount: "0.00",
        total: "36.31",
        notes: "Ready for pickup",
      })
      .returning();

    const item3 = menuItems[2] || menuItems[0];
    const item3Price = parseFloat(item3.price);
    await db.insert(orderItems).values({
      orderId: order2[0].id,
      itemId: item3.id,
      itemName: item3.name,
      itemPrice: item3.price,
      quantity: 1,
      customizationsTotal: "0.00",
      lineTotal: item3Price.toFixed(2),
      status: "ready",
      notes: "Extra sauce on the side",
    });

    // Order 2 timeline
    await db.insert(orderTimeline).values([
      {
        orderId: order2[0].id,
        status: "pending",
        changedByStaffId: staffMembers[0].id,
        note: "Order created",
      },
      {
        orderId: order2[0].id,
        status: "confirmed",
        changedByStaffId: staffMembers[0].id,
        note: "Order confirmed",
      },
      {
        orderId: order2[0].id,
        status: "preparing",
        changedByStaffId: staffMembers[1].id,
        note: "Kitchen started preparation",
      },
      {
        orderId: order2[0].id,
        status: "ready",
        changedByStaffId: staffMembers[1].id,
        note: "Order ready for pickup",
      },
    ]);

    // Order 2 payment
    await db.insert(payments).values({
      orderId: order2[0].id,
      amount: "31.31",
      tipAmount: "5.00",
      method: "card",
      status: "completed",
      paidAt: new Date(),
    });

    // Order 3: Delivery order, pending
    const order3Number = await generateOrderNumber(location.id, todayStr);
    const order3 = await db
      .insert(orders)
      .values({
        locationId: location.id,
        customerId: sampleCustomers[2].id,
        assignedStaffId: staffMembers[0].id,
        orderNumber: order3Number,
        orderType: "delivery",
        status: "preparing",
        paymentStatus: "unpaid",
        paymentTiming: "pay_later",
        subtotal: "52.97",
        taxAmount: "4.24",
        serviceCharge: "0.00",
        tipAmount: "0.00",
        discountAmount: "5.00",
        total: "52.21",
        notes: "Delivery to 123 Main St",
      })
      .returning();

    const item4 = menuItems[3] || menuItems[0];
    const item4Price = parseFloat(item4.price);
    const item5 = menuItems[4] || menuItems[0];
    const item5Price = parseFloat(item5.price);

    await db.insert(orderItems).values([
      {
        orderId: order3[0].id,
        itemId: item4.id,
        itemName: item4.name,
        itemPrice: item4.price,
        quantity: 2,
        customizationsTotal: "0.00",
        lineTotal: (item4Price * 2).toFixed(2),
        status: "preparing",
        notes: "One spicy, one mild",
      },
      {
        orderId: order3[0].id,
        itemId: item5.id,
        itemName: item5.name,
        itemPrice: item5.price,
        quantity: 1,
        customizationsTotal: "0.00",
        lineTotal: item5Price.toFixed(2),
        status: "pending",
      },
    ]);

    // Order 3 timeline
    await db.insert(orderTimeline).values([
      {
        orderId: order3[0].id,
        status: "pending",
        changedByStaffId: staffMembers[0].id,
        note: "Order created",
      },
      {
        orderId: order3[0].id,
        status: "confirmed",
        changedByStaffId: staffMembers[0].id,
        note: "Order confirmed",
      },
      {
        orderId: order3[0].id,
        status: "preparing",
        changedByStaffId: staffMembers[1].id,
        note: "Kitchen started preparation",
      },
    ]);

    // Order 4: Completed dine-in order
    const order4Number = await generateOrderNumber(location.id, todayStr);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const order4 = await db
      .insert(orders)
      .values({
        locationId: location.id,
        customerId: sampleCustomers[3].id,
        tableId: restaurantTables[1].id,
        assignedStaffId: staffMembers[0].id,
        orderNumber: order4Number,
        orderType: "dine_in",
        status: "completed",
        paymentStatus: "paid",
        paymentTiming: "pay_later",
        subtotal: "35.98",
        taxAmount: "2.88",
        serviceCharge: "1.80",
        tipAmount: "8.00",
        discountAmount: "0.00",
        total: "47.66",
        completedAt: yesterday,
        createdAt: yesterday,
        updatedAt: yesterday,
      })
      .returning();

    const item6 = menuItems[5] || menuItems[0];
    const item6Price = parseFloat(item6.price);
    await db.insert(orderItems).values({
      orderId: order4[0].id,
      itemId: item6.id,
      itemName: item6.name,
      itemPrice: item6.price,
      quantity: 2,
      customizationsTotal: "0.00",
      lineTotal: (item6Price * 2).toFixed(2),
      status: "served",
    });

    // Order 4 timeline
    await db.insert(orderTimeline).values([
      {
        orderId: order4[0].id,
        status: "pending",
        changedByStaffId: staffMembers[0].id,
        note: "Order created",
        createdAt: yesterday,
      },
      {
        orderId: order4[0].id,
        status: "confirmed",
        changedByStaffId: staffMembers[0].id,
        note: "Order confirmed",
        createdAt: yesterday,
      },
      {
        orderId: order4[0].id,
        status: "preparing",
        changedByStaffId: staffMembers[1].id,
        note: "Kitchen started preparation",
        createdAt: yesterday,
      },
      {
        orderId: order4[0].id,
        status: "ready",
        changedByStaffId: staffMembers[1].id,
        note: "Order ready",
        createdAt: yesterday,
      },
      {
        orderId: order4[0].id,
        status: "completed",
        changedByStaffId: staffMembers[0].id,
        note: "Order completed",
        createdAt: yesterday,
      },
    ]);

    // Order 4 payment
    await db.insert(payments).values({
      orderId: order4[0].id,
      amount: "40.66",
      tipAmount: "8.00",
      method: "card",
      status: "completed",
      paidAt: yesterday,
      createdAt: yesterday,
    });

    // Order 5: Cancelled order
    const order5Number = await generateOrderNumber(location.id, todayStr);
    const order5 = await db
      .insert(orders)
      .values({
        locationId: location.id,
        customerId: sampleCustomers[0].id,
        assignedStaffId: staffMembers[0].id,
        orderNumber: order5Number,
        orderType: "pickup",
        status: "cancelled",
        paymentStatus: "refunded",
        paymentTiming: "pay_first",
        subtotal: "15.99",
        taxAmount: "1.28",
        serviceCharge: "0.00",
        tipAmount: "0.00",
        discountAmount: "0.00",
        total: "17.27",
        cancelledAt: new Date(),
        cancellationReason: "Customer requested cancellation",
      })
      .returning();

    const item7 = menuItems[0];
    const item7Price = parseFloat(item7.price);
    await db.insert(orderItems).values({
      orderId: order5[0].id,
      itemId: item7.id,
      itemName: item7.name,
      itemPrice: item7.price,
      quantity: 1,
      customizationsTotal: "0.00",
      lineTotal: item7Price.toFixed(2),
      status: "pending",
    });

    // Order 5 timeline
    await db.insert(orderTimeline).values([
      {
        orderId: order5[0].id,
        status: "pending",
        changedByStaffId: staffMembers[0].id,
        note: "Order created",
      },
      {
        orderId: order5[0].id,
        status: "cancelled",
        changedByStaffId: staffMembers[0].id,
        note: "Order cancelled by customer request",
      },
    ]);

    // Order 5 payment (refunded)
    await db.insert(payments).values({
      orderId: order5[0].id,
      amount: "17.27",
      tipAmount: "0.00",
      method: "card",
      status: "refunded",
      paidAt: new Date(),
      refundedAt: new Date(),
    });

    console.log(`   ✅ Created 5 orders with items, customizations, timeline, and payments\n`);

    console.log("\n✅ Orders data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Location: ${location.name}`);
    console.log(`   - Tables: ${restaurantTables.length}`);
    console.log(`   - Customers: ${sampleCustomers.length}`);
    console.log(`   - Staff: ${staffMembers.length}`);
    console.log(`   - Orders: 5`);
    console.log(`     • Order 1: Dine-in, confirmed, unpaid (Table ${restaurantTables[0].tableNumber})`);
    console.log(`     • Order 2: Pickup, ready, paid`);
    console.log(`     • Order 3: Delivery, preparing, unpaid`);
    console.log(`     • Order 4: Dine-in, completed, paid (yesterday)`);
    console.log(`     • Order 5: Pickup, cancelled, refunded`);
    console.log("\n🎉 You can now view the orders in your dashboard at /dashboard/orders!");
  } catch (error) {
    console.error("\n❌ Error seeding orders data:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the seed
seedOrdersData()
  .then(() => {
    console.log("\n✨ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
