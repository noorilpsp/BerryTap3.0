/**
 * Minimal seed for menu items so a fresh DB can run the full POS flow.
 * Run with: npm run seed:menu
 *
 * Idempotent: only creates items if none exist for the location.
 * Safe to run multiple times.
 */

import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { items, categories, categoryItems } from "../src/lib/db/schema/menus";
import { merchantLocations } from "../src/lib/db/schema/merchant-locations";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const SAMPLE_ITEMS = [
  { name: "Coffee", price: "3.50", description: "Hot brewed coffee" },
  { name: "Caesar Salad", price: "12.00", description: "Romaine, parmesan, croutons, Caesar dressing" },
  { name: "Margherita Pizza", price: "14.99", description: "Tomato, mozzarella, basil" },
  { name: "Cheeseburger", price: "11.50", description: "Beef patty, cheese, lettuce, tomato" },
  { name: "Chocolate Cake", price: "6.99", description: "House-made chocolate cake" },
];

async function seedMenu() {
  console.log("🌱 Starting menu seed...\n");

  try {
    // Step 1: Get first location
    console.log("📍 Step 1: Finding location...");
    const locations = await db.query.merchantLocations.findMany({
      limit: 1,
    });

    if (locations.length === 0) {
      console.error("❌ No locations found. Create a location first (e.g. via /dashboard/stores).");
      process.exit(1);
    }

    const location = locations[0];
    console.log(`   ✅ Using location: ${location.name} (${location.id})\n`);

    // Step 2: Check if items already exist (idempotent)
    console.log("🍽️  Step 2: Checking for existing items...");
    const existingItems = await db.query.items.findMany({
      where: eq(items.locationId, location.id),
      limit: 1,
      columns: { id: true },
    });

    if (existingItems.length > 0) {
      console.log("   ⏭️  Items already exist. Skipping (idempotent).\n");
      return;
    }

    // Step 3: Create category and items
    console.log("📁 Step 3: Creating category and items...");
    const [category] = await db
      .insert(categories)
      .values({
        locationId: location.id,
        name: "Mains",
        emoji: "🍽️",
        displayOrder: 0,
      })
      .returning();

    const insertedItems = await db
      .insert(items)
      .values(
        SAMPLE_ITEMS.map((item, i) => ({
          locationId: location.id,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          status: "live" as const,
          displayOrder: i,
        }))
      )
      .returning();

    // Link items to category
    await db.insert(categoryItems).values(
      insertedItems.map((item, i) => ({
        categoryId: category.id,
        itemId: item.id,
        displayOrder: i,
      }))
    );

    console.log(`   ✅ Created category "Mains" and ${insertedItems.length} items\n`);
    console.log("✨ Done. Run full POS flow: seat party → add items → fire wave → advance → close.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedMenu();
