import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processMeetingIntelligence } from "@/lib/inngest/functions/meeting-intelligence";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeetingIntelligence],
  serveHost: "http://127.0.0.1:3000",
});