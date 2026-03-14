import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { customers, customerNotes } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * POST /api/customers/[id]/notes
 * Add a staff note for a customer.
 * Body: { text, authorName?, role?, staffId? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
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
    const { text, authorName, role, staffId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, customer.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    const [note] = await db
      .insert(customerNotes)
      .values({
        customerId,
        staffId: staffId ?? null,
        authorName: authorName ?? null,
        role: role ?? null,
        text: text.trim(),
      })
      .returning();

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[POST /api/customers/[id]/notes] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to add note",
      },
      { status: 500 }
    );
  }
}
