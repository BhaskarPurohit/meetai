import { z } from "zod";

/**
 * Environment variable validation using Zod.
 *
 * WHY THIS EXISTS:
 * process.env.X returns `string | undefined` — TypeScript can't help you at runtime.
 * This file parses ALL env vars at startup. If anything is missing or malformed,
 * the app crashes immediately with a clear error message instead of failing
 * silently at the worst possible moment in production.
 *
 * RULE: Never import process.env directly anywhere in the codebase.
 * Always import { env } from "@/lib/env"
 */

const envSchema = z.object({
  // ─── App ────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url({
    message: "NEXT_PUBLIC_APP_URL must be a valid URL (e.g. http://localhost:3000)",
  }),

  // ─── Database (Supabase Postgres) ────────────────────────────────────────
  DATABASE_URL: z.string().url({
    message: "DATABASE_URL must be a valid Postgres connection string",
  }),
  DIRECT_URL: z.string().url({
    message:
      "DIRECT_URL is required for Drizzle migrations (use the direct connection string from Supabase, not the pooled one)",
  }),

  // ─── Auth (Better Auth) ──────────────────────────────────────────────────
  BETTER_AUTH_SECRET: z.string().min(32, {
    message:
      "BETTER_AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32",
  }),
  BETTER_AUTH_URL: z.string().url({
    message: "BETTER_AUTH_URL must match your app URL (e.g. http://localhost:3000)",
  }),

  // ─── Google OAuth ────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1, {
    message: "GOOGLE_CLIENT_ID is required for Google OAuth",
  }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, {
    message: "GOOGLE_CLIENT_SECRET is required for Google OAuth",
  }),

  // ─── Stream (Video + Chat) ────────────────────────────────────────────────
  NEXT_PUBLIC_STREAM_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_STREAM_KEY is required — get it from getstream.io dashboard",
  }),
  STREAM_SECRET: z.string().min(1, {
    message: "STREAM_SECRET is required — get it from getstream.io dashboard",
  }),

  // ─── OpenAI ───────────────────────────────────────────────────────────────
  OPENAI_API_KEY: z.string().startsWith("sk-", {
    message: "OPENAI_API_KEY must start with 'sk-' — get it from platform.openai.com",
  }),

  // ─── Polar (Payments / Subscriptions) ────────────────────────────────────
  POLAR_ACCESS_TOKEN: z.string().min(1, {
    message: "POLAR_ACCESS_TOKEN is required — get it from polar.sh dashboard",
  }),
  POLAR_WEBHOOK_SECRET: z.string().min(1, {
    message: "POLAR_WEBHOOK_SECRET is required — set it when creating a webhook in Polar",
  }),
  POLAR_ORGANIZATION_ID: z.string().min(1, {
    message: "POLAR_ORGANIZATION_ID is required — find it in your Polar org settings",
  }),

  // ─── Inngest (Background Jobs) ────────────────────────────────────────────
  INNGEST_EVENT_KEY: z.string().min(1, {
    message: "INNGEST_EVENT_KEY is required — get it from inngest.com dashboard",
  }),
  INNGEST_SIGNING_KEY: z.string().min(1, {
    message: "INNGEST_SIGNING_KEY is required — get it from inngest.com dashboard",
  }),
});

// This runs synchronously at import time.
// The app will CRASH on startup if any variable is missing — exactly what we want.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`  ✗ ${issue.path.join(".")}: ${issue.message}`);
  });
  console.error(
    "\nFix the above issues in your .env.local file and restart the server.\n"
  );
  // Crash the process — better to fail fast than limp along with undefined vars
  process.exit(1);
}

export const env = parsed.data;

// Type export — useful for anywhere you need to pass env around
export type Env = z.infer<typeof envSchema>;
