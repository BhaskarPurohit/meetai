import { db } from "@/lib/db";
import { meetings, actionItems, agents, meetingEmbeddings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
  const [allMeetings, allActionItems, allAgents, allEmbeddings] = await Promise.all([
    db.query.meetings.findMany({ where: eq(meetings.userId, userId) }),
    db.query.actionItems.findMany({ where: eq(actionItems.userId, userId) }),
    db.query.agents.findMany({ where: eq(agents.userId, userId) }),
    db.query.meetingEmbeddings.findMany({ where: eq(meetingEmbeddings.userId, userId) }),
  ]);

  return {
    totalMeetings: allMeetings.length,
    openActionItems: allActionItems.filter((a) => !a.completed).length,
    activeAgents: allAgents.length,
    knowledgeChunks: allEmbeddings.length,
  };
}