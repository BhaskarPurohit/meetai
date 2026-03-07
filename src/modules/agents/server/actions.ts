"use server";

import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  persona: z.enum(["scribe", "devil_advocate", "timekeeper", "decision_tracker", "custom"]),
  systemPrompt: z.string().min(1).max(2000),
  description: z.string().max(300).optional(),
});

export async function createAgent(formData: z.infer<typeof createAgentSchema>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const parsed = createAgentSchema.safeParse(formData);
  if (!parsed.success) throw new Error("Invalid input");

  const { name, persona, systemPrompt, description } = parsed.data;

  const [agent] = await db
    .insert(agents)
    .values({
      userId: session.user.id,
      name,
      persona,
      systemPrompt,
      description,
    })
    .returning();

  revalidatePath("/dashboard/agents");
  return agent;
}

export async function deleteAgent(agentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db
    .delete(agents)
    .where(and(eq(agents.id, agentId), eq(agents.userId, session.user.id)));

  revalidatePath("/dashboard/agents");
}

export async function updateAgent(
  agentId: string,
  formData: Partial<z.infer<typeof createAgentSchema>>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const [agent] = await db
    .update(agents)
    .set({ ...formData, updatedAt: new Date() })
    .where(and(eq(agents.id, agentId), eq(agents.userId, session.user.id)))
    .returning();

  revalidatePath("/dashboard/agents");
  return agent;
}