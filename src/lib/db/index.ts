import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Two connections are needed for Supabase:
 *
 * 1. `queryClient` — uses the POOLED connection (DATABASE_URL, port 6543).
 *    Used for all application queries. Supabase's pgBouncer handles connection
 *    pooling so we don't exhaust Postgres connections under load.
 *
 * 2. `migrationClient` — uses the DIRECT connection (DIRECT_URL, port 5432).
 *    Used ONLY for migrations. pgBouncer doesn't support the extended query
 *    protocol that Drizzle's migration runner needs.
 */

const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient, {
  schema,
  logger: env.NODE_ENV === "development",  // logs all SQL in dev — remove in prod
});

// Only instantiate migration client when explicitly needed
export const getMigrationClient = () => postgres(env.DIRECT_URL, { max: 1 });