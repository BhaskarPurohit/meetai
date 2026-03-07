import { db } from "@/lib/db";
import { meetingEmbeddings, meetings } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { generateEmbedding } from "@/lib/openai";

export async function semanticSearch(query: string, userId: string, limit = 8) {
  const embedding = await generateEmbedding(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT
      me.id,
      me.content,
      me.meeting_id,
      m.name as meeting_name,
      m.created_at as meeting_date,
      1 - (me.embedding <=> ${embeddingStr}::vector) as similarity
    FROM meeting_embeddings me
    JOIN meetings m ON me.meeting_id = m.id
    WHERE me.user_id = ${userId}
    ORDER BY me.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return results.rows as {
    id: string;
    content: string;
    meeting_id: string;
    meeting_name: string;
    meeting_date: string;
    similarity: number;
  }[];
}