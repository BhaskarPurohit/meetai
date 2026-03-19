"use client";
import { createAuthClient } from "better-auth/react";

// Derive baseURL from the current window origin at runtime so the client
// always hits the same domain it was loaded from — no hardcoded URL needed.
// Falls back to NEXT_PUBLIC_APP_URL for SSR contexts (e.g. server components
// that import this file) where window is unavailable.
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({ baseURL });

export const { signIn, signOut, signUp, useSession } = authClient;