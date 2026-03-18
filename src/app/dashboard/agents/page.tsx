import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AgentsListView } from "@/modules/agents/ui/views/agents-list-view";

export default async function AgentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return <AgentsListView userId={session.user.id} />;
}