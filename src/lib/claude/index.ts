import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { PROMPTS } from "@/lib/openai";

const claude = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// MEETING ANALYSIS
// Mirrors the exact return shape previously produced by gpt-4o-mini so that
// downstream Inngest steps require zero changes.
// ─────────────────────────────────────────────────────────────────────────────

export type MeetingAnalysis = {
  summary: string;
  sentiment: "productive" | "neutral" | "tense";
  actionItems: { owner: string; task: string; dueDate?: string }[];
  decisions: string[];
  keyTopics: string[];
  followUpEmail: string;
};

export async function analyzeMeeting(
  transcript: string,
  agentSystemPrompt?: string
): Promise<MeetingAnalysis> {
  const system = agentSystemPrompt
    ? `${agentSystemPrompt}\n\nBased on the above perspective, analyze the meeting and return structured JSON.`
    : "You are an expert meeting analyst.";

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    temperature: 0.2,
    system,
    messages: [
      { role: "user", content: PROMPTS.MEETING_INTELLIGENCE(transcript) },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  // Strip markdown code fences if Claude wraps the JSON despite instructions
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as MeetingAnalysis;
}
