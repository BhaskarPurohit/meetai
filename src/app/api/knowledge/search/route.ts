import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/modules/knowledge/server/queries";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const results = await semanticSearch(q, session.user.id);
  return NextResponse.json({ results });
}