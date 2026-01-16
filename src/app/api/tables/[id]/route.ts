import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { tables } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/tables/[id]
 * Get single table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const table = await db.query.tables.findFirst({
      where: eq(tables.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, table.location.merchantId),
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

    return NextResponse.json(table);
  } catch (error) {
    console.error("[GET /api/tables/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch table",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tables/[id]
 * Update table (including status)
 * Body: { tableNumber?, seats?, status? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { tableNumber, seats, status } = body;

    // Get existing table
    const existingTable = await db.query.tables.findFirst({
      where: eq(tables.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingTable.location.merchantId),
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

    // Check if table number already exists (if changing)
    if (tableNumber && tableNumber !== existingTable.tableNumber) {
      const duplicateTable = await db.query.tables.findFirst({
        where: and(
          eq(tables.locationId, existingTable.locationId),
          eq(tables.tableNumber, tableNumber)
        ),
      });

      if (duplicateTable) {
        return NextResponse.json(
          { error: "Table number already exists for this location" },
          { status: 409 }
        );
      }
    }

    // Update table
    const updateData: any = {
      updatedAt: new Date(),
    };
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber;
    if (seats !== undefined) updateData.seats = seats;
    if (status !== undefined) updateData.status = status;

    const [updatedTable] = await db
      .update(tables)
      .set(updateData)
      .where(eq(tables.id, params.id))
      .returning();

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("[PUT /api/tables/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update table",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tables/[id]
 * Delete table
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get existing table
    const existingTable = await db.query.tables.findFirst({
      where: eq(tables.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingTable.location.merchantId),
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

    // Delete table
    await db.delete(tables).where(eq(tables.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/tables/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to delete table",
      },
      { status: 500 }
    );
  }
}
