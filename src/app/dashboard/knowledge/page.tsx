import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KnowledgeClient } from "@/modules/knowledge/ui/components/knowledge-client";

export default async function KnowledgePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return <KnowledgeClient userId={session.user.id}/>;
}