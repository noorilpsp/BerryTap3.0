import { NextRequest, NextResponse } from "next/server";
import { sendInvitationEmail } from "@/lib/email";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { platformPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Test endpoint for email sending
 * GET /api/test-email?to=email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is platform personnel
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const personnel = await db.query.platformPersonnel.findFirst({
      where: eq(platformPersonnel.userId, user.id),
      columns: { isActive: true },
    });

    if (!personnel || !personnel.isActive) {
      return NextResponse.json(
        { error: "Forbidden: platform personnel only" },
        { status: 403 },
      );
    }

    // Get email from query params
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get("to");

    if (!testEmail) {
      return NextResponse.json(
        { error: "Missing 'to' query parameter. Usage: /api/test-email?to=your@email.com" },
        { status: 400 },
      );
    }

    // Send test invitation email
    const result = await sendInvitationEmail(
      testEmail,
      "test-token-12345",
      "Test Merchant",
      "admin",
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        messageId: result.messageId,
        to: testEmail,
        note: "Check your inbox (and spam folder) for the invitation email.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
          to: testEmail,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[test-email] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 },
    );
  }
}

