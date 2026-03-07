"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMeeting } from "@/modules/meetings/server/actions";
import type { Agent } from "@/lib/db/schema";
import { toast } from "sonner";

export function NewMeetingDialog({
  agents,
  onClose,
}: {
  agents: Agent[];
  onClose: (created?:boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState<string>("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("Meeting name is required."); return; }
    setError("");
    startTransition(async () => {
      try {
        const meeting = await createMeeting({
          name,
          agentId: agentId || undefined,
        });
        onClose(true);
        router.push(`/dashboard/meetings/${meeting.id}`);
      } catch {
        setError("Failed to create meeting. Please try again.");
        toast("Failled to create meeting!")
      }
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">New Meeting</h2>
          <button className="dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-body">
          <div className="field">
            <label className="field-label">Meeting Name</label>
            <input
              className="field-input"
              placeholder="e.g. Q4 Sprint Planning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          {agents.length > 0 && (
            <div className="field">
              <label className="field-label">AI Agent (optional)</label>
              <select
                className="field-input field-select"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                <option value="">No agent</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {agents.length === 0 && (
            <p className="dialog-hint">
              Tip: Create an agent first and it will automatically join and take notes.
            </p>
          )}

          {error && <div className="auth-error">{error}</div>}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <span className="btn-spinner" /> : null}
            {isPending ? "Creating..." : "Create & Join"}
          </button>
        </div>
      </div>
    </div>
  );
}