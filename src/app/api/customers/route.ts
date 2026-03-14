import { NextRequest, NextResponse } from "next/server";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { customers } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/customers
 * List customers for a location
 * Query params: locationId (required), q (optional, min 2 chars) – search by name, phone, or email
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
    const q = searchParams.get("q")?.trim();

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

    // Fetch customers
    const baseWhere = eq(customers.locationId, locationId);
    const searchWhere =
      q && q.length >= 2
        ? and(
            baseWhere,
            or(
              ilike(customers.name ?? "", `%${q}%`),
              ilike(customers.phone ?? "", `%${q}%`),
              ilike(customers.email ?? "", `%${q}%`)
            )
          )
        : baseWhere;

    const customersList = await db.query.customers.findMany({
      where: searchWhere,
      orderBy: [desc(customers.createdAt)],
      limit: 50,
    });

    return NextResponse.json(customersList, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[GET /api/customers] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create customer (guest or linked to user)
 * Body: { locationId, userId?, name?, email?, phone? }
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
      userId,
      name,
      email,
      phone,
      birthday,
      anniversary,
      profileMeta,
    } = body;

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

    const [newCustomer] = await db
      .insert(customers)
      .values({
        locationId,
        userId: userId || null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        birthday: birthday ?? null,
        anniversary: anniversary ?? null,
        profileMeta: profileMeta ?? null,
      })
      .returning();

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("[POST /api/customers] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create customer",
      },
      { status: 500 }
    );
  }
}
