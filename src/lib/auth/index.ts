import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  // Email + password as fallback
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Email verification
  // TODO: replace the stub below with a real provider (Resend, SendGrid, etc.)
  // Until then, the verification link is printed to the server console for local dev.
  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      console.warn(
        `[MeetAI] Verify email for ${user.email} → ${url}\n` +
          `Wire up a real email provider in src/lib/auth/index.ts to send this automatically.`
      );
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,          // 7 days
    updateAge: 60 * 60 * 24,              // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                    // cache session cookie for 5 min
    },
  },

  // Trusted origins — prevents CSRF
  // VERCEL_URL is set automatically per deployment (no protocol prefix).
  // The wildcard covers all preview deployment URLs for this project.
  trustedOrigins: [
    env.BETTER_AUTH_URL,
    "https://meetai-gules-delta.vercel.app",
    "https://meetai-bhaskarpurohits-projects.vercel.app",
    // Wildcard covers every preview URL: meetai-<hash>-bhaskarpurohits-projects.vercel.app
    "https://*.vercel.app",
    // Current deployment URL injected at runtime by Vercel
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ].filter(Boolean) as string[],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".vercel.app",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;