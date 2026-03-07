import { getMeetingsByUser } from "@/modules/meetings/server/queries";
import { getAgentsByUser } from "@/modules/agents/server/queries";
import { MeetingsClient } from "../components/meetings-client";

export async function MeetingsListView({ userId }: { userId: string }) {
  const [meetings, agents] = await Promise.all([
    getMeetingsByUser(userId),
    getAgentsByUser(userId),
  ]);
  return <MeetingsClient initialMeetings={meetings} agents={agents} />;
}