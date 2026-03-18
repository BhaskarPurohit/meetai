import { auth } from "@/lib/auth";
import { generateStreamToken } from "@/lib/stream/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateStreamToken(session.user.id);
  return NextResponse.json({
    token,
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image ?? null,
  });
}