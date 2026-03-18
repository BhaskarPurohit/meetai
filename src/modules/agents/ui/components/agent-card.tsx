"use client";

import { useState, useTransition } from "react";
import type { Agent } from "@/lib/db/schema";
import { deleteAgent } from "@/modules/agents/server/actions";
import { toast } from "sonner";

const PERSONA_META = {
  scribe: { label: "Scribe", color: "#6366f1", desc: "Accurate notes & transcription" },
  devil_advocate: { label: "Devil's Advocate", color: "#ef4444", desc: "Challenges assumptions" },
  timekeeper: { label: "Timekeeper", color: "#f59e0b", desc: "Keeps meetings on schedule" },
  decision_tracker: { label: "Decision Tracker", color: "#10b981", desc: "Logs every decision" },
  custom: { label: "Custom", color: "#8b5cf6", desc: "Your own instructions" },
} as const;

export function AgentCard({ agent }: { agent: Agent }) {
  const meta = PERSONA_META[agent.persona];
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    startTransition(async () => {
         await deleteAgent(agent.id)
         toast.success("Agent Deleted!")});
  };

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div
          className="agent-persona-badge"
          style={{ color: meta.color, background: `${meta.color}15` }}
        >
          {meta.label}
        </div>
        <button
          className={`agent-delete-btn ${confirming ? "confirming" : ""}`}
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "..." : confirming ? "Confirm?" : "Delete"}
        </button>
      </div>

      <h3 className="agent-name">{agent.name}</h3>
      {agent.description && (
        <p className="agent-description">{agent.description}</p>
      )}
      <p className="agent-persona-desc">{meta.desc}</p>

      <div className="agent-prompt-preview">
        <span className="agent-prompt-label">System prompt</span>
        <p className="agent-prompt-text">
          {agent.systemPrompt.slice(0, 120)}
          {agent.systemPrompt.length > 120 ? "…" : ""}
        </p>
      </div>
    </div>
  );
}