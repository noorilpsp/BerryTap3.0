import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invitations, merchants } from "@/db/schema";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ token: string }>;
};

type InvitationResponse = {
  success: true;
  invitation: {
    id: string;
    merchant_id: string;
    merchant_name: string;
    email: string;
    role: string;
    expires_at: string;
  };
};

type ErrorResponse = {
  success: false;
  error: string;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<InvitationResponse | ErrorResponse>> {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid invitation token" },
        { status: 400 },
      );
    }

    // Query invitation with merchant details using join
    const result = await db
      .select({
        id: invitations.id,
        merchantId: invitations.merchantId,
        email: invitations.email,
        role: invitations.role,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        merchantName: merchants.name,
      })
      .from(invitations)
      .innerJoin(merchants, eq(merchants.id, invitations.merchantId))
      .where(eq(invitations.token, token))
      .limit(1);

    const invitation = result[0];

    // Check if invitation exists
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 },
      );
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { success: false, error: "This invitation has already been accepted" },
        { status: 410 },
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt <= now) {
      return NextResponse.json(
        { success: false, error: "This invitation has expired" },
        { status: 410 },
      );
    }

    // Invitation is valid
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        merchant_id: invitation.merchantId,
        merchant_name: invitation.merchantName || "Unknown Merchant",
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[invitations/verify] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify invitation",
      },
      { status: 500 },
    );
  }
}

