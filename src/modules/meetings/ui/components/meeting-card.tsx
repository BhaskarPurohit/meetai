"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { MeetingWithIntelligence } from "@/lib/db/schema";
import { MeetingStatusBadge } from "./meeting-status-badge";
import { deleteMeeting } from "@/modules/meetings/server/actions";
import { toast } from "sonner";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  return `${m}m`;
}

export function MeetingCard({ meeting }: { meeting: MeetingWithIntelligence }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="meeting-card">
      <div className="meeting-card-top">
        <div className="meeting-card-meta">
          <MeetingStatusBadge status={meeting.status} />
          {meeting.durationSeconds && (
            <span className="meeting-duration">
              {formatDuration(meeting.durationSeconds)}
            </span>
          )}
        </div>
        <button
          className="meeting-delete-btn"
          disabled={isPending}
          onClick={() => startTransition(
            async () => {
                await deleteMeeting(meeting.id)
                toast.success("Meeting Deleted!")
            }
          )}
        >
          {isPending ? "..." : "✕"}
        </button>
      </div>

      <Link href={`/dashboard/meetings/${meeting.id}`} className="meeting-card-link">
        <h3 className="meeting-name">{meeting.name}</h3>
        <p className="meeting-date">{formatDate(meeting.createdAt)}</p>
        {meeting.agent && (
          <p className="meeting-agent">Agent: {meeting.agent.name}</p>
        )}
        {meeting.intelligence?.summary && (
          <p className="meeting-summary">
            {meeting.intelligence.summary.slice(0, 120)}…
          </p>
        )}
      </Link>

      <div className="meeting-card-footer">
        {meeting.status === "upcoming" && (
          <Link href={`/dashboard/meetings/${meeting.id}`} className="btn-join">
            Join Meeting →
          </Link>
        )}
        {meeting.status === "completed" && meeting.intelligence && (
          <Link href={`/dashboard/meetings/${meeting.id}`} className="btn-view-intel">
            View Intelligence →
          </Link>
        )}
      </div>
    </div>
  );
}