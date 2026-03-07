import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getMeetingById } from "@/modules/meetings/server/queries";
import { MeetingDetailView } from "@/modules/meetings/ui/views/meeting-detail-view";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const { id } = await params;
  const meeting = await getMeetingById(id, session.user.id);
  if (!meeting) notFound();

  return (
    <div className="meeting-detail-page">
      <MeetingDetailView meeting={meeting} />
    </div>
  );
}