import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Supabase
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Stream
  NEXT_PUBLIC_STREAM_KEY: z.string().min(1),
  STREAM_SECRET: z.string().min(1),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),

  // Voyage AI
  VOYAGE_API_KEY: z.string().min(1),

  // Polar
  POLAR_ACCESS_TOKEN: z.string().min(1),
  POLAR_WEBHOOK_SECRET: z.string().min(1),
  POLAR_ORGANIZATION_ID: z.string().min(1),

  // Inngest
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`  ✗ ${issue.path.join(".")}: ${issue.message}`);
  });
  console.error("\nFix the above in your .env.local and restart.\n");
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;