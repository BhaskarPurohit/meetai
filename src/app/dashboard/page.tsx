import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MeetingsListView } from "@/modules/meetings/ui/views/meetings-list-view";
import { DashboardStats } from "@/modules/dashboard/ui/views/dashboard-stats";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  return (
    <div className="meetings-page">
      <Suspense fallback={<div className="stats-row-skeleton" />}>
        <DashboardStats userId={session.user.id} />
      </Suspense>
      <MeetingsListView userId={session.user.id} />
    </div>
  );
}