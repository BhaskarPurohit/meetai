import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 *
 * Used by:
 * - Vercel deployment checks
 * - Uptime monitoring (UptimeRobot, Better Uptime)
 * - Your resume: "I always add a health check endpoint" = senior instinct
 *
 * Returns 200 if DB is reachable, 503 if not.
 */
export async function GET() {
  const start = Date.now();

  try {
    // Lightweight DB ping — doesn't scan any tables
    await db.execute(sql`SELECT 1`);

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
        services: {
          database: "ok",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[health-check] Database unreachable:", error);

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - start,
        services: {
          database: "error",
        },
      },
      { status: 503 }
    );
  }
}