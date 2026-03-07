import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { meetings, meetingIntelligence, actionItems, meetingEmbeddings } from "@/lib/db/schema";
import { openai, PROMPTS, generateEmbedding, chunkTranscript } from "@/lib/openai";
import { eq } from "drizzle-orm";

/**
 * MEETING INTELLIGENCE PIPELINE
 *
 * Triggered when a meeting ends. Runs as a durable background job via Inngest.
 * If any step fails, Inngest automatically retries just that step — not the whole function.
 *
 * Pipeline:
 * 1. Fetch transcript from Stream
 * 2. Run OpenAI analysis → structured intelligence report
 * 3. Save intelligence report to DB
 * 4. Denormalize action items to their own table
 * 5. Generate embeddings for knowledge base
 * 6. Send integration webhooks (Slack, Notion, etc.)
 */
export const processMeetingIntelligence = inngest.createFunction(
  {
    id: "process-meeting-intelligence",
    name: "Process Meeting Intelligence",
    retries: 3,
    // Throttle: max 10 concurrent runs to control OpenAI costs
    concurrency: { limit: 10 },
  },
  { event: "meeting/ended" },
  async ({ event, step }) => {
    const { meetingId, userId } = event.data;

    // ── Step 1: Mark processing as started ──────────────────────────────────
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

    // ── Step 2: Fetch the meeting and transcript ─────────────────────────────
    const meeting = await step.run("fetch-meeting", async () => {
      const [result] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, meetingId));

      if (!result) throw new Error(`Meeting ${meetingId} not found`);
      if (!result.rawTranscript) throw new Error(`Meeting ${meetingId} has no transcript`);

      return result;
    });

    // ── Step 3: Run OpenAI analysis ──────────────────────────────────────────
    // This is the expensive step — Inngest will retry ONLY this step if it fails
    const intelligence = await step.run("analyze-transcript", async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",           // fast and cheap for structured extraction
        messages: [
          {
            role: "user",
            content: PROMPTS.MEETING_INTELLIGENCE(meeting.rawTranscript!),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,              // low temp = more consistent structured output
      });

      const raw = completion.choices[0].message.content;
      if (!raw) throw new Error("OpenAI returned empty response");

      return JSON.parse(raw) as {
        summary: string;
        sentiment: "productive" | "neutral" | "tense";
        actionItems: { owner: string; task: string; dueDate?: string }[];
        decisions: string[];
        keyTopics: string[];
        followUpEmail: string;
      };
    });

    // ── Step 4: Save intelligence report ────────────────────────────────────
    await step.run("save-intelligence", async () => {
      await db
        .insert(meetingIntelligence)
        .values({
          meetingId,
          summary: intelligence.summary,
          sentiment: intelligence.sentiment,
          actionItems: intelligence.actionItems,
          decisions: intelligence.decisions,
          keyTopics: intelligence.keyTopics,
          followUpEmail: intelligence.followUpEmail,
          processingCompletedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: meetingIntelligence.meetingId,
          set: {
            summary: intelligence.summary,
            sentiment: intelligence.sentiment,
            actionItems: intelligence.actionItems,
            decisions: intelligence.decisions,
            keyTopics: intelligence.keyTopics,
            followUpEmail: intelligence.followUpEmail,
            processingCompletedAt: new Date(),
            processingError: null,
          },
        });
    });

    // ── Step 5: Denormalize action items ─────────────────────────────────────
    // Store in separate table for cross-meeting queries ("show all my open tasks")
    await step.run("save-action-items", async () => {
      if (intelligence.actionItems.length === 0) return;

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

    // ── Step 6: Generate embeddings for knowledge base ───────────────────────
    await step.run("generate-embeddings", async () => {
      const transcript = meeting.rawTranscript!;
      const chunks = chunkTranscript(transcript);

      // Generate embeddings in parallel — but batch to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await Promise.all(batch.map(generateEmbedding));

        await db.insert(meetingEmbeddings).values(
          batch.map((chunk, j) => ({
            meetingId,
            userId,
            content: chunk,
            embedding: embeddings[j],
            chunkIndex: i + j,
          }))
        );
      }
    });

    // ── Step 7: Send integration webhooks ───────────────────────────────────
    await step.sendEvent("trigger-integrations", {
      name: "meeting/intelligence.completed",
      data: { meetingId, userId },
    });

    return { meetingId, actionItemsCount: intelligence.actionItems.length };
  }
);

/**
 * INTEGRATION WEBHOOKS
 * Fires after intelligence is ready — sends to Slack, Notion, etc.
 */
export const sendIntegrationWebhooks = inngest.createFunction(
  {
    id: "send-integration-webhooks",
    name: "Send Integration Webhooks",
    retries: 2,
  },
  { event: "meeting/intelligence.completed" },
  async ({ event, step }) => {
    const { meetingId, userId } = event.data;

    // Fetch intelligence + user integrations in parallel
    const [intelligenceResult, userIntegrations] = await step.run(
      "fetch-data",
      async () => {
        const { meetingIntelligence: mi, integrations } = await import("@/lib/db/schema");
        const { and, eq: drizzleEq } = await import("drizzle-orm");

        const [intel, integrationList] = await Promise.all([
          db.select().from(mi).where(drizzleEq(mi.meetingId, meetingId)),
          db
            .select()
            .from(integrations)
            .where(
              and(
                drizzleEq(integrations.userId, userId),
                drizzleEq(integrations.enabled, true)
              )
            ),
        ]);

        return [intel[0], integrationList];
      }
    );

    if (!intelligenceResult) return { skipped: "no intelligence found" };

    // Send to each enabled integration
    for (const integration of userIntegrations) {
      if (integration.type === "slack") {
        await step.run(`send-slack-${integration.id}`, async () => {
          const webhookUrl = (integration.config as Record<string, string>).webhookUrl;
          if (!webhookUrl) return;

          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `📋 *Meeting Summary*\n${intelligenceResult.summary}\n\n*Action Items:* ${
                (intelligenceResult.actionItems as { task: string }[])
                  .map((a) => `• ${a.task}`)
                  .join("\n")
              }`,
            }),
          });
        });
      }
      // Add Notion, Google Calendar handlers here
    }

    return { webhooksSent: userIntegrations.length };
  }
);