import { db } from "@/lib/db";
import { meetings, actionItems, agents, meetingEmbeddings } from "@/lib/db/schema";
import { eq, desc, count, and } from "drizzle-orm";

export async function getMeetingsByUser(userId: string) {
  return db.query.meetings.findMany({
    where: eq(meetings.userId, userId),
    orderBy: desc(meetings.createdAt),
    with: { agent: true, intelligence: true },
  });
}

export async function getMeetingById(id: string, userId: string) {
  return db.query.meetings.findFirst({
    where: (m, { and, eq }) => and(eq(m.id, id), eq(m.userId, userId)),
    with: { agent: true, intelligence: true, actionItems: true },
  });
}

export async function getDashboardStats(userId: string) {
  const [
    [{ totalMeetings }],
    [{ openActionItems }],
    [{ activeAgents }],
    [{ knowledgeChunks }],
  ] = await Promise.all([
    db.select({ totalMeetings: count() }).from(meetings).where(eq(meetings.userId, userId)),
    db
      .select({ openActionItems: count() })
      .from(actionItems)
      .where(and(eq(actionItems.userId, userId), eq(actionItems.completed, false))),
    db.select({ activeAgents: count() }).from(agents).where(eq(agents.userId, userId)),
    db
      .select({ knowledgeChunks: count() })
      .from(meetingEmbeddings)
      .where(eq(meetingEmbeddings.userId, userId)),
  ]);

  return { totalMeetings, openActionItems, activeAgents, knowledgeChunks };
}