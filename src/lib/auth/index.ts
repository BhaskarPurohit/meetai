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
    requireEmailVerification: false, // set true in production with email provider
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
  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;