import { getAgentsByUser } from "@/modules/agents/server/queries";
import { AgentsClient } from "../components/agents-client";

export async function AgentsListView({ userId }: { userId: string }) {
  const agents = await getAgentsByUser(userId);
  return <AgentsClient initialAgents={agents} />;
}