import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { db } from "@/db";
import { invitations, merchantUsers } from "@/db/schema";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// Ensure websocket support for Neon transactions in a Node runtime
if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;
}

function getTransactionDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
}

type RouteParams = {
  params: Promise<{ token: string }>;
};

type AcceptResponse = {
  success: true;
  merchant_id: string;
  redirect: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<AcceptResponse | ErrorResponse>> {
  try {
    // Get authenticated user
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to accept this invitation." },
        { status: 401 },
      );
    }

    const { token } = await params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid invitation token" },
        { status: 400 },
      );
    }

    // Query invitation by token
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      columns: {
        id: true,
        merchantId: true,
        email: true,
        role: true,
        locationAccess: true,
        expiresAt: true,
        acceptedAt: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 },
      );
    }

    // SECURITY CHECK: Verify email matches
    if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: `This invitation was sent to ${invitation.email}, but you're logged in as ${user.email}. Please log out and sign in with the correct email address.`,
        },
        { status: 403 },
      );
    }

    // Verify invitation is still valid
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { success: false, error: "This invitation has already been accepted" },
        { status: 410 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt <= now) {
      return NextResponse.json(
        { success: false, error: "This invitation has expired" },
        { status: 410 },
      );
    }

    // Check if user is already a member of this merchant
    const existingMembership = await db.query.merchantUsers.findFirst({
      where: (merchantUsers, { and, eq }) =>
        and(
          eq(merchantUsers.merchantId, invitation.merchantId),
          eq(merchantUsers.userId, user.id),
        ),
    });

    if (existingMembership) {
      // User already has access, but we should still mark invitation as accepted
      const txDb = getTransactionDb();
      await txDb.transaction(async (tx) => {
        await tx
          .update(invitations)
          .set({ acceptedAt: now })
          .where(eq(invitations.id, invitation.id));
      });

      return NextResponse.json({
        success: true,
        merchant_id: invitation.merchantId,
        redirect: "/dashboard",
      });
    }

    // Use transaction to create merchant_users record and update invitation
    const txDb = getTransactionDb();
    await txDb.transaction(async (tx) => {
      // Insert into merchant_users
      await tx.insert(merchantUsers).values({
        merchantId: invitation.merchantId,
        userId: user.id,
        role: invitation.role,
        locationAccess: invitation.locationAccess ?? null,
        acceptedAt: now,
        invitedAt: null, // Could be set from invitation.createdAt if needed
        isActive: true,
      });

      // Update invitation to mark as accepted
      await tx
        .update(invitations)
        .set({ acceptedAt: now })
        .where(eq(invitations.id, invitation.id));
    });

    return NextResponse.json({
      success: true,
      merchant_id: invitation.merchantId,
      redirect: "/dashboard",
    });
  } catch (error) {
    console.error("[invitations/accept] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
      },
      { status: 500 },
    );
  }
}

