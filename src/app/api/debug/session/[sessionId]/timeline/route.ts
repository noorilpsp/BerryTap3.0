import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { sessions, sessionEvents } from "@/lib/db/schema/orders";

export const runtime = "nodejs";

/**
 * GET /api/debug/session/[sessionId]/timeline
 * Returns a chronological timeline of everything that happened during the session.
 * Read-only. For debugging and analytics.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const sessionRow = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      columns: { id: true },
    });

    if (!sessionRow) {
      return NextResponse.json(
        { ok: false, error: "Session not found", sessionId },
        { status: 404 }
      );
    }

    const events = await db.query.sessionEvents.findMany({
      where: eq(sessionEvents.sessionId, sessionId),
      orderBy: [asc(sessionEvents.createdAt)],
    });

    const timeline = events.map((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : null;
      const time = d
        ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        : null;

      return {
        time,
        type: e.type,
        actorType: e.actorType ?? undefined,
        actorId: e.actorId ?? undefined,
        meta: e.meta ?? undefined,
      };
    });

    return NextResponse.json({
      ok: true,
      sessionId,
      timeline,
    });
  } catch (error) {
    console.error("[GET /api/debug/session/[sessionId]/timeline] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
