"use server";

import { db } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { streamServerClient } from "@/lib/stream/server";
import { z } from "zod";

const createMeetingSchema = z.object({
  name: z.string().min(1).max(200),
  agentId: z.string().uuid().optional(),
});

export async function createMeeting(formData: z.infer<typeof createMeetingSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = createMeetingSchema.safeParse(formData);
  if (!parsed.success) throw new Error("Invalid input");

  // Create Stream call first — get the call ID
  const callId = crypto.randomUUID();
  const call = streamServerClient.video.call("default", callId);
  await call.getOrCreate({
    data: {
      created_by_id: session.user.id,
      custom: { meetingName: parsed.data.name },
    },
  });

  const [meeting] = await db
    .insert(meetings)
    .values({
      userId: session.user.id,
      agentId: parsed.data.agentId ?? null,
      name: parsed.data.name,
      streamCallId: callId,
      status: "upcoming",
    })
    .returning();

  revalidatePath("/dashboard");
  return meeting;
}

export async function deleteMeeting(meetingId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db
    .delete(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.userId, session.user.id)));

  revalidatePath("/dashboard");
}