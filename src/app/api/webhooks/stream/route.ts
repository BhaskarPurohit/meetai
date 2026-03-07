import { NextRequest, NextResponse } from "next/server";
import { streamServerClient } from "@/lib/stream/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature") ?? "";

    // Verify the webhook is genuinely from Stream
    const isValid = streamServerClient.verifyWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as {
      type: string;
      call?: { custom?: { meetingId?: string }; id?: string };
    };

    // Only process call.ended events
    if (event.type !== "call.ended") {
      return NextResponse.json({ received: true });
    }

    const streamCallId = event.call?.id;
    if (!streamCallId) return NextResponse.json({ received: true });

    // Find the meeting by streamCallId
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.streamCallId, streamCallId),
    });

    if (!meeting) return NextResponse.json({ received: true });

    // Mark as completed
    await db
      .update(meetings)
      .set({ status: "completed", endedAt: new Date(), updatedAt: new Date() })
      .where(eq(meetings.id, meeting.id));

    // Trigger intelligence pipeline
    await inngest.send({
      name: "meeting/ended",
      data: { meetingId: meeting.id, userId: meeting.userId },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stream webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}