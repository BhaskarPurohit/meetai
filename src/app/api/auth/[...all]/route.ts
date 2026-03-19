import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// Handle CORS preflight requests sent by browsers before POST /api/auth/*
export function OPTIONS() {
  return new Response(null, { status: 204 });
}