import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardTopbar } from "@/components/shared/dashboard-topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  return (
    <div className="dashboard-root">
      <DashboardSidebar user={session.user} />
      <div className="dashboard-main">
        <DashboardTopbar user={session.user} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}