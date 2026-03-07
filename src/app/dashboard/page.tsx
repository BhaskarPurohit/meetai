import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MeetingsListView } from "@/modules/meetings/ui/views/meetings-list-view";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return <MeetingsListView userId={session.user.id} />;
}