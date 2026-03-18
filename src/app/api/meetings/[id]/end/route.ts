import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { durationSeconds?: number; transcript?: string };

  const [meeting] = await db
    .update(meetings)
    .set({
      status: "completed",
      endedAt: new Date(),
      durationSeconds: body.durationSeconds ?? null,
      rawTranscript: body.transcript ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(meetings.id, id), eq(meetings.userId, session.user.id)))
    .returning();

  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fire Inngest background job (non-fatal — Inngest dev server may not be running)
  try {
    await inngest.send({
      name: "meeting/ended",
      data: { meetingId: meeting.id, userId: session.user.id },
    });
  } catch (e) {
    console.warn("Inngest event failed (is the dev server running?):", e);
  }

  return NextResponse.json({ success: true });
}