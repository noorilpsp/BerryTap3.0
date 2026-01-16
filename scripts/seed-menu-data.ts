/**
 * Seed script to add sample menu data to the database
 * Run with: npm run seed:menu
 */

import { loadEnvConfig } from "@next/env";
import { db } from "../src/db";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);
import {
  menus,
  categories,
  items,
  tags,
  allergens,
  customizationGroups,
  customizationOptions,
  menuCategories,
  categoryItems,
  itemTags,
  itemAllergens,
  itemCustomizations,
} from "../src/lib/db/schema/menus";
import { merchantLocations } from "../src/lib/db/schema/merchant-locations";
import { eq } from "drizzle-orm";

async function seedMenuData() {
  console.log("🌱 Starting menu data seed...\n");

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

    // Step 2: Create Tags
    console.log("🏷️  Step 2: Creating tags...");
    const createdTags = await db
      .insert(tags)
      .values([
        { locationId: location.id, name: "Popular", color: "#FF5733" },
        { locationId: location.id, name: "Vegetarian", color: "#4CAF50" },
        { locationId: location.id, name: "Spicy", color: "#F44336" },
        { locationId: location.id, name: "New", color: "#2196F3" },
        { locationId: location.id, name: "Chef's Pick", color: "#FF9800" },
      ])
      .returning();
    const [tagPopular, tagVegetarian, tagSpicy, tagNew, tagChefPick] = createdTags;
    console.log(`   ✅ Created ${createdTags.length} tags\n`);

    // Step 3: Create Allergens
    console.log("⚠️  Step 3: Creating allergens...");
    const createdAllergens = await db
      .insert(allergens)
      .values([
        { locationId: location.id, name: "Dairy", icon: "milk" },
        { locationId: location.id, name: "Gluten", icon: "wheat" },
        { locationId: location.id, name: "Nuts", icon: "nut" },
        { locationId: location.id, name: "Eggs", icon: "egg" },
      ])
      .returning();
    const [allergenDairy, allergenGluten, allergenNuts, allergenEggs] = createdAllergens;
    console.log(`   ✅ Created ${createdAllergens.length} allergens\n`);

    // Step 4: Create Customization Groups
    console.log("⚙️  Step 4: Creating customization groups...");
    const [sizeGroup, toppingsGroup, dressingGroup] = await db
      .insert(customizationGroups)
      .values([
        {
          locationId: location.id,
          name: "Pizza Size",
          customerInstructions: "Choose your pizza size",
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Toppings",
          customerInstructions: "Add extra toppings",
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
          displayOrder: 1,
        },
        {
          locationId: location.id,
          name: "Salad Dressing",
          customerInstructions: "Choose your dressing",
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          displayOrder: 2,
        },
      ])
      .returning();

    // Create options for customization groups
    const [sizeSmall, sizeMedium, sizeLarge] = await db
      .insert(customizationOptions)
      .values([
        { groupId: sizeGroup.id, name: 'Small (10")', price: "0.00", displayOrder: 0 },
        { groupId: sizeGroup.id, name: 'Medium (14")', price: "4.00", displayOrder: 1 },
        { groupId: sizeGroup.id, name: 'Large (18")', price: "8.00", displayOrder: 2 },
      ])
      .returning();

    const [toppingMushrooms, toppingOlives, toppingCheese] = await db
      .insert(customizationOptions)
      .values([
        { groupId: toppingsGroup.id, name: "Mushrooms", price: "2.00", displayOrder: 0 },
        { groupId: toppingsGroup.id, name: "Olives", price: "2.00", displayOrder: 1 },
        { groupId: toppingsGroup.id, name: "Extra Cheese", price: "3.00", displayOrder: 2 },
      ])
      .returning();

    const [dressingCaesar, dressingRanch, dressingBalsamic] = await db
      .insert(customizationOptions)
      .values([
        { groupId: dressingGroup.id, name: "Caesar Dressing", price: "0.00", displayOrder: 0 },
        { groupId: dressingGroup.id, name: "Ranch Dressing", price: "0.00", displayOrder: 1 },
        { groupId: dressingGroup.id, name: "Balsamic Vinaigrette", price: "0.00", displayOrder: 2 },
      ])
      .returning();

    console.log(`   ✅ Created 3 customization groups with options\n`);

    // Step 5: Create Menus
    console.log("📋 Step 5: Creating menus...");
    const [lunchMenu, dinnerMenu] = await db
      .insert(menus)
      .values([
        {
          locationId: location.id,
          name: "Lunch Menu",
          description: "Our delicious lunch offerings",
          schedule: {
            monday: [{ open: "11:00", close: "16:00" }],
            tuesday: [{ open: "11:00", close: "16:00" }],
            wednesday: [{ open: "11:00", close: "16:00" }],
            thursday: [{ open: "11:00", close: "16:00" }],
            friday: [{ open: "11:00", close: "16:00" }],
          },
          availabilityDelivery: true,
          availabilityPickup: true,
          availabilityDineIn: true,
          status: "active",
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Dinner Menu",
          description: "Evening dining experience",
          schedule: {
            monday: [{ open: "16:00", close: "23:00" }],
            tuesday: [{ open: "16:00", close: "23:00" }],
            wednesday: [{ open: "16:00", close: "23:00" }],
            thursday: [{ open: "16:00", close: "23:00" }],
            friday: [{ open: "16:00", close: "23:00" }],
            saturday: [{ open: "16:00", close: "23:00" }],
            sunday: [{ open: "16:00", close: "22:00" }],
          },
          availabilityDelivery: true,
          availabilityPickup: true,
          availabilityDineIn: true,
          status: "active",
          displayOrder: 1,
        },
      ])
      .returning();
    console.log(`   ✅ Created 2 menus\n`);

    // Step 6: Create Categories
    console.log("📁 Step 6: Creating categories...");
    const [catAppetizers, catSalads, catPizzas, catPasta, catDesserts] = await db
      .insert(categories)
      .values([
        {
          locationId: location.id,
          name: "Appetizers",
          emoji: "🥗",
          description: "Start your meal with these delicious options",
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Salads",
          emoji: "🥬",
          description: "Fresh, healthy salads",
          displayOrder: 1,
        },
        {
          locationId: location.id,
          name: "Pizzas",
          emoji: "🍕",
          description: "Wood-fired artisan pizzas",
          displayOrder: 2,
        },
        {
          locationId: location.id,
          name: "Pasta",
          emoji: "🍝",
          description: "Traditional Italian pasta dishes",
          displayOrder: 3,
        },
        {
          locationId: location.id,
          name: "Desserts",
          emoji: "🍰",
          description: "Sweet treats to finish your meal",
          displayOrder: 4,
        },
      ])
      .returning();

    // Link categories to menus
    await db.insert(menuCategories).values([
      { menuId: lunchMenu.id, categoryId: catAppetizers.id, displayOrder: 0 },
      { menuId: lunchMenu.id, categoryId: catSalads.id, displayOrder: 1 },
      { menuId: lunchMenu.id, categoryId: catPizzas.id, displayOrder: 2 },
      { menuId: lunchMenu.id, categoryId: catPasta.id, displayOrder: 3 },
      { menuId: lunchMenu.id, categoryId: catDesserts.id, displayOrder: 4 },
      { menuId: dinnerMenu.id, categoryId: catAppetizers.id, displayOrder: 0 },
      { menuId: dinnerMenu.id, categoryId: catSalads.id, displayOrder: 1 },
      { menuId: dinnerMenu.id, categoryId: catPizzas.id, displayOrder: 2 },
      { menuId: dinnerMenu.id, categoryId: catPasta.id, displayOrder: 3 },
      { menuId: dinnerMenu.id, categoryId: catDesserts.id, displayOrder: 4 },
    ]);

    console.log(`   ✅ Created 5 categories and linked to menus\n`);

    // Step 7: Create Items
    console.log("🍽️  Step 7: Creating menu items...");
    const [itemCaesar, itemMargherita, itemPepperoni, itemCarbonara, itemTiramisu, itemWings] = await db
      .insert(items)
      .values([
        {
          locationId: location.id,
          name: "Caesar Salad",
          description: "Fresh romaine lettuce, parmesan cheese, croutons, Caesar dressing",
          price: "12.50",
          calories: 350,
          status: "live",
          useCustomHours: false,
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Margherita Pizza",
          description: "Classic tomato sauce, fresh mozzarella, and basil",
          price: "14.99",
          status: "live",
          useCustomHours: false,
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Pepperoni Pizza",
          description: "Tomato sauce, mozzarella, and pepperoni",
          price: "16.99",
          status: "live",
          useCustomHours: false,
          displayOrder: 1,
        },
        {
          locationId: location.id,
          name: "Spaghetti Carbonara",
          description: "Pasta with eggs, cheese, pancetta, and black pepper",
          price: "15.99",
          status: "draft",
          useCustomHours: false,
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Tiramisu",
          description: "Classic Italian dessert with coffee and mascarpone",
          price: "7.99",
          status: "live",
          useCustomHours: false,
          displayOrder: 0,
        },
        {
          locationId: location.id,
          name: "Chicken Wings",
          description: "Crispy wings with your choice of sauce",
          price: "12.99",
          status: "soldout",
          useCustomHours: false,
          displayOrder: 0,
        },
      ])
      .returning();

    // Link items to categories
    await db.insert(categoryItems).values([
      { categoryId: catSalads.id, itemId: itemCaesar.id, displayOrder: 0 },
      { categoryId: catPizzas.id, itemId: itemMargherita.id, displayOrder: 0 },
      { categoryId: catPizzas.id, itemId: itemPepperoni.id, displayOrder: 1 },
      { categoryId: catPasta.id, itemId: itemCarbonara.id, displayOrder: 0 },
      { categoryId: catDesserts.id, itemId: itemTiramisu.id, displayOrder: 0 },
      { categoryId: catAppetizers.id, itemId: itemWings.id, displayOrder: 0 },
    ]);

    // Link items to tags
    await db.insert(itemTags).values([
      { itemId: itemCaesar.id, tagId: tagPopular.id },
      { itemId: itemCaesar.id, tagId: tagChefPick.id },
      { itemId: itemMargherita.id, tagId: tagVegetarian.id },
      { itemId: itemMargherita.id, tagId: tagPopular.id },
      { itemId: itemPepperoni.id, tagId: tagPopular.id },
      { itemId: itemPepperoni.id, tagId: tagSpicy.id },
      { itemId: itemCarbonara.id, tagId: tagNew.id },
      { itemId: itemTiramisu.id, tagId: tagPopular.id },
      { itemId: itemWings.id, tagId: tagSpicy.id },
    ]);

    // Link items to allergens
    await db.insert(itemAllergens).values([
      { itemId: itemCaesar.id, allergenId: allergenDairy.id },
      { itemId: itemCaesar.id, allergenId: allergenGluten.id },
      { itemId: itemMargherita.id, allergenId: allergenDairy.id },
      { itemId: itemPepperoni.id, allergenId: allergenDairy.id },
      { itemId: itemCarbonara.id, allergenId: allergenEggs.id },
      { itemId: itemCarbonara.id, allergenId: allergenDairy.id },
      { itemId: itemTiramisu.id, allergenId: allergenDairy.id },
      { itemId: itemTiramisu.id, allergenId: allergenEggs.id },
    ]);

    // Link items to customization groups
    await db.insert(itemCustomizations).values([
      { itemId: itemCaesar.id, groupId: dressingGroup.id, displayOrder: 0 },
      { itemId: itemMargherita.id, groupId: sizeGroup.id, displayOrder: 0 },
      { itemId: itemMargherita.id, groupId: toppingsGroup.id, displayOrder: 1 },
      { itemId: itemPepperoni.id, groupId: sizeGroup.id, displayOrder: 0 },
      { itemId: itemPepperoni.id, groupId: toppingsGroup.id, displayOrder: 1 },
    ]);

    console.log(`   ✅ Created 6 items with relations\n`);

    console.log("\n✅ Menu data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Location: ${location.name}`);
    console.log(`   - Menus: 2 (Lunch, Dinner)`);
    console.log(`   - Categories: 5`);
    console.log(`   - Items: 6`);
    console.log(`   - Tags: 5`);
    console.log(`   - Allergens: 4`);
    console.log(`   - Customization Groups: 3`);
    console.log("\n🎉 You can now view the menu data in your dashboard!");
  } catch (error) {
    console.error("\n❌ Error seeding menu data:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run the seed
seedMenuData()
  .then(() => {
    console.log("\n✨ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
