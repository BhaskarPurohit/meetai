import Link from "next/link";
import type { MeetingWithAll } from "@/lib/db/schema";
import { MeetingStatusBadge } from "../components/meeting-status-badge";


import { CallUI } from "@/modules/agents/ui/components/call-ui";
import { IntelligencePoller } from "../components/meeting-intelligence-poller";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export function MeetingDetailView({ meeting }: { meeting: MeetingWithAll }) {
  const isJoinable = meeting.status === "upcoming" || meeting.status === "active";
  const isProcessing = meeting.status === "completed" && !meeting.intelligence?.summary;
  const hasIntel = !!meeting.intelligence?.summary;

  return (
    <div className="meeting-detail">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <Link href="/dashboard" className="detail-breadcrumb-link">Meetings</Link>
        <span className="detail-breadcrumb-sep">›</span>
        <span className="detail-breadcrumb-current">{meeting.name}</span>
      </div>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <div className="detail-header-meta">
            <MeetingStatusBadge status={meeting.status} />
            {meeting.durationSeconds && (
              <span className="detail-duration">{formatDuration(meeting.durationSeconds)}</span>
            )}
          </div>
          <h1 className="detail-title">{meeting.name}</h1>
          <p className="detail-subtitle">
            {formatDate(meeting.createdAt)}
            {meeting.agent && (
              <> · Agent: <span style={{ color: "var(--meetai-accent)" }}>{meeting.agent.name}</span></>
            )}
          </p>
        </div>
      </div>

      {/* Video call */}
      {isJoinable && meeting.streamCallId && (
        <CallUI meetingId={meeting.id} streamCallId={meeting.streamCallId} />
      )}

      {/* Processing — polls until report appears */}
      {isProcessing && <IntelligencePoller meetingId={meeting.id} />}

      {/* Intelligence report */}
      {hasIntel && (
        <div className="intel-section">
          <h2 className="intel-section-title">Meeting Intelligence</h2>
          <div className="intel-grid">
            <div className="intel-card intel-card-full">
              <div className="intel-card-title-row">
                <h3 className="intel-card-title">Summary</h3>
                {meeting.intelligence!.sentiment && (
                  <span
                    className="intel-sentiment"
                    data-sentiment={meeting.intelligence!.sentiment}
                  >
                    {meeting.intelligence!.sentiment}
                  </span>
                )}
              </div>
              <p className="intel-card-body">{meeting.intelligence!.summary}</p>
            </div>

            {(meeting.intelligence!.keyTopics as string[])?.length > 0 && (
              <div className="intel-card">
                <h3 className="intel-card-title">Key Topics</h3>
                <div className="intel-tags">
                  {(meeting.intelligence!.keyTopics as string[]).map((t, i) => (
                    <span key={i} className="intel-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {(meeting.intelligence!.decisions as string[])?.length > 0 && (
              <div className="intel-card">
                <h3 className="intel-card-title">Decisions</h3>
                <ul className="intel-list">
                  {(meeting.intelligence!.decisions as string[]).map((d, i) => (
                    <li key={i} className="intel-list-item">
                      <span className="intel-list-dot" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.actionItems?.length > 0 && (
              <div className="intel-card">
                <h3 className="intel-card-title">Action Items</h3>
                <div className="intel-action-items">
                  {meeting.actionItems.map((a) => (
                    <div key={a.id} className="intel-action-item">
                      <div className="intel-action-dot" />
                      <div className="intel-action-body">
                        <span className="intel-action-task">{a.task}</span>
                        {a.owner && <span className="intel-action-owner">{a.owner}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meeting.intelligence!.followUpEmail && (
              <div className="intel-card intel-card-full">
                <h3 className="intel-card-title">Follow-up Email Draft</h3>
                <pre className="intel-email">{meeting.intelligence!.followUpEmail as string}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming with no call yet */}
      {meeting.status === "upcoming" && !meeting.streamCallId && (
        <div className="meeting-no-intel">
          <p>Call details not available. Please refresh.</p>
        </div>
      )}
    </div>
  );
}