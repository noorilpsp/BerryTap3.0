/**
 * Seed script to create staff rows for merchant users at the first location.
 * Required for session creation (ensure session, add items, etc.).
 * Run with: npm run seed:staff
 *
 * Idempotent: safe to run multiple times. Only creates staff when missing.
 */

import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { merchantLocations } from "../src/lib/db/schema/merchant-locations";
import { merchantUsers } from "../src/lib/db/schema/merchant-users";
import { staff } from "../src/lib/db/schema/staff";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const DEFAULT_PIN = "1234";

async function seedStaff() {
  console.log("🌱 Starting staff seed...\n");

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

    // Step 2: Get active merchant users for this merchant
    console.log("👥 Step 2: Finding merchant users...");
    const users = await db.query.merchantUsers.findMany({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
        eq(merchantUsers.isActive, true)
      ),
      columns: { userId: true },
    });

    if (users.length === 0) {
      console.error("❌ No merchant users found. Add users to the merchant first.");
      process.exit(1);
    }

    console.log(`   ✅ Found ${users.length} merchant user(s)\n`);

    // Step 3: Ensure staff row for each user (idempotent)
    const pinHash = await hash(DEFAULT_PIN, 10);
    const today = new Date().toISOString().slice(0, 10);

    let created = 0;
    for (const { userId } of users) {
      const existing = await db.query.staff.findFirst({
        where: and(
          eq(staff.userId, userId),
          eq(staff.locationId, location.id),
          eq(staff.isActive, true)
        ),
        columns: { id: true },
      });

      if (existing) {
        console.log(`   ⏭️  Staff already exists for user ${userId.slice(0, 8)}...`);
        continue;
      }

      await db.insert(staff).values({
        userId,
        locationId: location.id,
        fullName: "Dev Staff",
        pinCodeHash: pinHash,
        role: "server",
        isActive: true,
        hiredAt: today,
      });
      created++;
      console.log(`   ✅ Created staff for user ${userId.slice(0, 8)}...`);
    }

    console.log(`\n✨ Done. Created ${created} staff row(s). Default PIN: ${DEFAULT_PIN}`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedStaff();
