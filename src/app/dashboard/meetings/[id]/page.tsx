import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getMeetingById } from "@/modules/meetings/server/queries";

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
    <div className="meeting-detail">
      <div className="meeting-detail-header">
        <h1 className="meeting-detail-title">{meeting.name}</h1>
        <p className="meeting-detail-meta">
          {meeting.agent ? `Agent: ${meeting.agent.name}` : "No agent"}
          {" · "}
          {new Date(meeting.createdAt).toLocaleDateString()}
        </p>
      </div>

      {meeting.streamCallId && (
        <div className="meeting-call-placeholder">
          <p className="meeting-call-hint">
            Stream Video Call ID: <code>{meeting.streamCallId}</code>
          </p>
          <p className="meeting-call-hint-sub">
            Video call UI (Stream SDK) — next step
          </p>
        </div>
      )}

      {meeting.intelligence ? (
        <div className="intel-grid">
          <div className="intel-card">
            <h3 className="intel-card-title">Summary</h3>
            <p className="intel-card-body">{meeting.intelligence.summary}</p>
          </div>
          {meeting.intelligence.decisions && meeting.intelligence.decisions.length > 0 && (
            <div className="intel-card">
              <h3 className="intel-card-title">Decisions</h3>
              <ul className="intel-list">
                {meeting.intelligence.decisions.map((d, i) => (
                  <li key={i} className="intel-list-item">{d}</li>
                ))}
              </ul>
            </div>
          )}
          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <div className="intel-card">
              <h3 className="intel-card-title">Action Items</h3>
              <ul className="intel-list">
                {meeting.actionItems.map((a) => (
                  <li key={a.id} className="intel-list-item">
                    <strong>{a.owner}</strong>: {a.task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="meeting-no-intel">
          <p>Intelligence report will appear here after the meeting ends.</p>
        </div>
      )}
    </div>
  );
}