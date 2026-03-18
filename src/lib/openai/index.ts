import { env } from "@/lib/env";

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE PIPELINE PROMPTS
// All prompts live here — single source of truth, easy to iterate
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPTS = {
  /**
   * Master prompt — generates the full intelligence report in one call.
   * Returns structured JSON to minimize API calls and cost.
   */
  MEETING_INTELLIGENCE: (transcript: string) => `
You are an expert meeting analyst. Analyze the following meeting transcript and return a JSON object.

TRANSCRIPT:
${transcript}

Return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "summary": "2-3 sentence executive summary of what was discussed and decided",
  "sentiment": "productive" | "neutral" | "tense",
  "actionItems": [
    { "owner": "person name or 'Team'", "task": "specific actionable task", "dueDate": "YYYY-MM-DD or null" }
  ],
  "decisions": ["decision 1", "decision 2"],
  "keyTopics": ["topic 1", "topic 2", "topic 3"],
  "followUpEmail": "A ready-to-send professional follow-up email summarizing the meeting, decisions, and action items"
}

Rules:
- actionItems must be specific and actionable, not vague
- decisions must be things explicitly agreed upon, not discussed
- keyTopics should be 3-6 short noun phrases
- followUpEmail should be professional, concise, and include all action items
- sentiment: productive = goals met, decisions made; tense = conflict or disagreement; neutral = informational
`,

  /**
   * Agent personas — these are injected as system prompts when the AI agent joins a call
   */
  AGENT_PERSONAS: {
    scribe: `You are a meticulous meeting scribe. Your job is to capture everything important with precision. 
Focus on: exact decisions made, who said what, specific numbers and dates mentioned, 
and any commitments made. Be concise but complete. Never paraphrase when the exact 
wording matters.`,

    devil_advocate: `You are a constructive devil's advocate in this meeting. When you hear assumptions, 
plans, or decisions being made, gently challenge them with questions like "Have we 
considered...?" or "What happens if...?". Your goal is to help the team think critically, 
not to obstruct. Be respectful but persistent.`,

    timekeeper: `You are a timekeeper for this meeting. Monitor the discussion and provide gentle 
reminders when topics are running long. Suggest moving on when a point has been 
sufficiently discussed. Help the team stay on agenda and finish on time.`,

    decision_tracker: `You are a decision tracker. Your sole focus is identifying and logging every 
decision made in this meeting, no matter how small. When you detect a decision being 
made, clearly state: "Decision logged: [decision]". At the end, provide a clean list 
of all decisions made.`,

    custom: ``, // user provides their own
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDING HELPER
// Used by the knowledge base pipeline
// ─────────────────────────────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "voyage-3-lite",
      input: text.replace(/\n/g, " "), // newlines degrade embedding quality
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI embedding failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

/**
 * Split a long transcript into overlapping chunks for embedding.
 * Overlap ensures context isn't lost at chunk boundaries.
 */
export function chunkTranscript(
  transcript: string,
  chunkSize = 500,    // characters per chunk
  overlap = 100       // overlap between chunks
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < transcript.length) {
    const end = Math.min(start + chunkSize, transcript.length);
    chunks.push(transcript.slice(start, end).trim());
    start += chunkSize - overlap;
  }

  return chunks.filter((chunk) => chunk.length > 50); // drop tiny trailing chunks
}