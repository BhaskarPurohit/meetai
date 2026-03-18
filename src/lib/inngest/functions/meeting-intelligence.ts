import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { meetings, agents, meetingIntelligence, actionItems, meetingEmbeddings } from "@/lib/db/schema";
import { openai, PROMPTS, generateEmbedding, chunkTranscript } from "@/lib/openai";
import { eq } from "drizzle-orm";

export const processMeetingIntelligence = inngest.createFunction(
  {
    id: "process-meeting-intelligence",
    name: "Process Meeting Intelligence",
    retries: 3,
  },
  { event: "meeting/ended" },
  async ({ event, step }) => {
    const { meetingId, userId } = event.data;

    // Step 1 — mark processing started
    await step.run("mark-processing-started", async () => {
      await db
        .insert(meetingIntelligence)
        .values({
          meetingId,
          summary: "",
          processingStartedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: meetingIntelligence.meetingId,
          set: { processingStartedAt: new Date(), processingError: null },
        });
    });

    // Step 2 — fetch meeting + transcript + agent
    const meeting = await step.run("fetch-meeting", async () => {
      return db.query.meetings.findFirst({
        where: eq(meetings.id, meetingId),
      });
    });

    if (!meeting?.rawTranscript) {
      await db
        .update(meetingIntelligence)
        .set({ processingError: "No transcript available" })
        .where(eq(meetingIntelligence.meetingId, meetingId));
      return { error: "No transcript" };
    }

    // Fetch agent system prompt if one is assigned to this meeting
    const agent = meeting.agentId
      ? await step.run("fetch-agent", async () => {
          return db.query.agents.findFirst({ where: eq(agents.id, meeting.agentId!) });
        })
      : null;

    // Step 3 — run OpenAI intelligence pipeline
    const intelligence = await step.run("run-ai-analysis", async () => {
      const prompt = PROMPTS.MEETING_INTELLIGENCE(meeting.rawTranscript!);
      // If the meeting has an agent, use its system prompt to shape the analysis focus
      const systemPrompt = agent?.systemPrompt
        ? `${agent.systemPrompt}\n\nBased on the above perspective, analyze the meeting and return structured JSON.`
        : "You are an expert meeting analyst.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const raw = response.choices[0].message.content ?? "{}";
      return JSON.parse(raw) as {
        summary: string;
        sentiment: "productive" | "neutral" | "tense";
        actionItems: { owner: string; task: string; dueDate?: string }[];
        decisions: string[];
        keyTopics: string[];
        followUpEmail: string;
      };
    });

    // Step 4 — save intelligence report
    await step.run("save-intelligence", async () => {
      await db
        .update(meetingIntelligence)
        .set({
          summary: intelligence.summary,
          sentiment: intelligence.sentiment,
          actionItems: intelligence.actionItems,
          decisions: intelligence.decisions,
          keyTopics: intelligence.keyTopics,
          followUpEmail: intelligence.followUpEmail,
          processingCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(meetingIntelligence.meetingId, meetingId));
    });

    // Step 5 — denormalize action items
    await step.run("save-action-items", async () => {
      if (!intelligence.actionItems.length) return;
      await db.insert(actionItems).values(
        intelligence.actionItems.map((item) => ({
          meetingId,
          userId,
          task: item.task,
          owner: item.owner,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        }))
      );
    });

    // Step 6 — generate embeddings for knowledge base
    await step.run("generate-embeddings", async () => {
      const chunks = chunkTranscript(meeting.rawTranscript!);
      const embeddings = await Promise.all(
        chunks.map((chunk) => generateEmbedding(chunk))
      );
      await db.insert(meetingEmbeddings).values(
        chunks.map((chunk, i) => ({
          meetingId,
          userId,
          content: chunk,
          embedding: embeddings[i],
          chunkIndex: i,
        }))
      );
    });

    return { success: true, meetingId };
  }
);