import { NextRequest, NextResponse } from "next/server";
import { streamServerClient } from "@/lib/stream/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";

// Parse Stream's JSONL transcript into plain text
async function fetchAndParseTranscript(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch transcript: ${res.status}`);
  const text = await res.text();

  const segments: string[] = [];
  for (const line of text.trim().split("\n")) {
    try {
      const obj = JSON.parse(line) as { text?: string; type?: string };
      if (obj.text?.trim()) segments.push(obj.text.trim());
    } catch {
      // skip malformed lines
    }
  }
  return segments.join(" ");
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  // Verify Stream webhook signature
  try {
    const isValid = streamServerClient.verifyWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    call_cid?: string;
    call_transcription?: { url?: string };
  };

  // call_cid is in format "default:callId" — extract the callId part
  const callId = event.call_cid?.split(":")[1];

  switch (event.type) {
    case "call.session_started": {
      if (callId) {
        await db
          .update(meetings)
          .set({ status: "active", startedAt: new Date(), updatedAt: new Date() })
          .where(eq(meetings.streamCallId, callId));
      }
      break;
    }

    case "call.transcription_ready": {
      const transcriptUrl = event.call_transcription?.url;
      if (!callId || !transcriptUrl) break;

      try {
        const transcript = await fetchAndParseTranscript(transcriptUrl);
        if (!transcript) break;

        const [meeting] = await db
          .update(meetings)
          .set({ rawTranscript: transcript, updatedAt: new Date() })
          .where(eq(meetings.streamCallId, callId))
          .returning();

        if (meeting) {
          try {
            await inngest.send({
              name: "meeting/ended",
              data: { meetingId: meeting.id, userId: meeting.userId },
            });
          } catch (e) {
            console.warn("Inngest event failed:", e);
          }
        }
      } catch (e) {
        console.error("Failed to process transcript:", e);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
