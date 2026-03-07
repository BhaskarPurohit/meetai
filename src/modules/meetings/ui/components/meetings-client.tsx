"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { MeetingWithIntelligence, Agent } from "@/lib/db/schema";
import { MeetingCard } from "./meeting-card";
import { NewMeetingDialog } from "./new-meeting-dialog";

export function MeetingsClient({
  initialMeetings,
  agents,
}: {
  initialMeetings: MeetingWithIntelligence[];
  agents: Agent[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(searchParams.get("new") === "1");

  const handleClose = () => {
    setShowDialog(false);
    router.replace("/dashboard");
  };

  return (
    <div className="meetings-page">
      <div className="meetings-toolbar">
        <p className="meetings-count">
          {initialMeetings.length} meeting{initialMeetings.length !== 1 ? "s" : ""}
        </p>
        <button className="btn-primary-sm" onClick={() => setShowDialog(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Meeting
        </button>
      </div>

      {initialMeetings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="10" width="40" height="28" rx="6" stroke="#2a2e4a" strokeWidth="2"/>
              <path d="M32 24L40 19v10l-8-5z" fill="#2a2e4a"/>
              <circle cx="24" cy="24" r="4" stroke="#6366f1" strokeWidth="2"/>
              <path d="M24 20v-6M24 34v-6M20 24h-6M34 24h-6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="empty-title">No meetings yet</h3>
          <p className="empty-desc">
            Start your first meeting and MeetAI will automatically capture
            summaries, action items, and build your knowledge base.
          </p>
          <button className="empty-cta" onClick={() => setShowDialog(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Start New Meeting
          </button>
        </div>
      ) : (
        <div className="meetings-grid">
          {initialMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}

      {showDialog && (
        <NewMeetingDialog agents={agents} onClose={handleClose} />
      )}
    </div>
  );
}