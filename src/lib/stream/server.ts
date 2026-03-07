import { StreamClient } from "@stream-io/node-sdk";
import { env } from "@/lib/env";

/**
 * Stream server client — used in API routes and Inngest functions only.
 * NEVER import this in client components (exposes STREAM_SECRET).
 *
 * Use cases:
 * - Generating user tokens for the frontend SDK
 * - Creating/updating calls server-side
 * - Receiving and verifying Stream webhooks
 */
export const streamServerClient = new StreamClient(
  env.NEXT_PUBLIC_STREAM_KEY,
  env.STREAM_SECRET
);

/**
 * Generate a Stream token for a given user.
 * Call this from a tRPC procedure — never expose STREAM_SECRET to the client.
 */
export function generateStreamToken(userId: string): string {
  // Token expires in 1 hour — enough for any meeting
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  return streamServerClient.generateUserToken({
    user_id: userId,
    exp: expirationTime,
    iat: issuedAt,
  });
}