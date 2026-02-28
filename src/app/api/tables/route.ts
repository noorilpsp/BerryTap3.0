import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { tables } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { getComputedStatusesForTables } from "@/app/actions/tables";
import { createTableMutation } from "@/domain/table-mutations";

export const runtime = "nodejs";

/**
 * GET /api/tables
 * List all tables for a location
 * Query params: locationId (required), status? (filter by status)
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

    const [tablesList, computedStatuses] = await Promise.all([
      db.query.tables.findMany({
        where: eq(tables.locationId, locationId),
        orderBy: [desc(tables.createdAt)],
      }),
      getComputedStatusesForTables(locationId),
    ]);

    let result = tablesList.map((t) => ({
      ...t,
      status: computedStatuses.get(t.id) ?? t.status,
    }));

    if (status) {
      result = result.filter((t) => t.status === status);
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[GET /api/tables] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch tables",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables
 * Create a new table
 * Body: { locationId, tableNumber, seats?, status? }
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
    const { locationId, tableNumber, seats, status } = body;

    if (!locationId || !tableNumber) {
      return NextResponse.json(
        { error: "Location ID and table number are required" },
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

    const result = await createTableMutation({
      locationId,
      tableNumber,
      seats: seats || null,
      status,
    });
    if (!result.ok) {
      if (result.reason === "table_number_exists") {
        return NextResponse.json(
          { error: "Table number already exists for this location" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Invalid table status" },
        { status: 400 }
      );
    }

    return NextResponse.json(result.table, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tables] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create table",
      },
      { status: 500 }
    );
  }
}
