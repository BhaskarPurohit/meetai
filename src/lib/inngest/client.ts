import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "meetai",
  name: "MeetAI",
});

// Typed event map — add new events here as the app grows
export type MeetingEndedEvent = {
  name: "meeting/ended";
  data: {
    meetingId: string;
    userId: string;
  };
};

export type Events = {
  "meeting/ended": MeetingEndedEvent;
};