import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAgentsByUser(userId: string) {
  return db.query.agents.findMany({
    where: eq(agents.userId, userId),
    orderBy: desc(agents.createdAt),
  });
}

export async function getAgentById(id: string, userId: string) {
  return db.query.agents.findFirst({
    where: (a, { and, eq }) => and(eq(a.id, id), eq(a.userId, userId)),
  });
}

export async function getDefaultAgent(userId: string) {
  return db.query.agents.findFirst({
    where: (a, { and, eq }) =>
      and(eq(a.userId, userId), eq(a.isDefault, true)),
  });
}