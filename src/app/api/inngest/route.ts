import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processMeetingIntelligence } from "@/lib/inngest/functions/meeting-intelligence";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeetingIntelligence],
});