import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DIRECT_URL) {
  throw new Error(
    "DIRECT_URL is required for migrations.\n" +
    "Use the Direct connection string from Supabase (port 5432)."
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_URL },
  verbose: true,
  strict: true,
});
