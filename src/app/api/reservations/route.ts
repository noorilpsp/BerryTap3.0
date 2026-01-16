import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { reservations } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/reservations
 * List reservations for a location (with date filters)
 * Query params: locationId (required), status?, date?, startDate?, endDate?
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
    const whereConditions = [eq(reservations.locationId, locationId)];
    if (status) {
      whereConditions.push(eq(reservations.status, status as any));
    }
    if (date) {
      whereConditions.push(eq(reservations.reservationDate, date));
    } else if (startDate && endDate) {
      whereConditions.push(gte(reservations.reservationDate, startDate));
      whereConditions.push(lte(reservations.reservationDate, endDate));
    }

    // Fetch reservations
    const reservationsList = await db.query.reservations.findMany({
      where: and(...whereConditions),
      orderBy: [desc(reservations.reservationDate), desc(reservations.reservationTime)],
      limit: 100,
    });

    return NextResponse.json(reservationsList, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[GET /api/reservations] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch reservations",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Create reservation
 * Body: { locationId, customerId?, tableId?, partySize, reservationDate, reservationTime, status?, customerName, customerPhone?, customerEmail?, notes? }
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
      partySize,
      reservationDate,
      reservationTime,
      status,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = body;

    if (!locationId || !partySize || !reservationDate || !reservationTime || !customerName) {
      return NextResponse.json(
        { error: "Location ID, party size, reservation date, time, and customer name are required" },
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

    // Create reservation
    const [newReservation] = await db
      .insert(reservations)
      .values({
        locationId,
        customerId: customerId || null,
        tableId: tableId || null,
        partySize,
        reservationDate,
        reservationTime,
        status: status || "pending",
        customerName,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reservations] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create reservation",
      },
      { status: 500 }
    );
  }
}
