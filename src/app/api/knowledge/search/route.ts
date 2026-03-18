import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/modules/knowledge/server/queries";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { query?: string };
  const query = body.query?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const rows = await semanticSearch(query, session.user.id);

  // Normalise to camelCase for the client
  const results = rows.map((r) => ({
    id: r.id,
    meetingId: r.meeting_id,
    content: r.content,
    similarity: r.similarity,
    meeting: { name: r.meeting_name, createdAt: r.meeting_date },
  }));

  return NextResponse.json({ results });
}
