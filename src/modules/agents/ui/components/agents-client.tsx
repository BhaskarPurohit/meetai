"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Agent } from "@/lib/db/schema";
import { AgentCard } from "./agent-card";
import { NewAgentDialog } from "./new-agent-dialog";

export function AgentsClient({ initialAgents }: { initialAgents: Agent[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(searchParams.get("new") === "1");

  const handleClose = () => {
    setShowDialog(false);
    router.replace("/dashboard/agents");
  };

  return (
    <div className="agents-page">
      <div className="agents-toolbar">
        <p className="agents-count">
          {initialAgents.length} agent{initialAgents.length !== 1 ? "s" : ""}
        </p>
        <button className="btn-primary-sm" onClick={() => setShowDialog(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Agent
        </button>
      </div>

      {initialAgents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="8" stroke="#2a2e4a" strokeWidth="2"/>
              <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#2a2e4a" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="24" cy="18" r="3" fill="#6366f1"/>
            </svg>
          </div>
          <h3 className="empty-title">No agents yet</h3>
          <p className="empty-desc">
            Create an AI agent with a persona and it will automatically join
            your meetings, take notes, and generate insights.
          </p>
          <button className="empty-cta" onClick={() => setShowDialog(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create First Agent
          </button>
        </div>
      ) : (
        <div className="agents-grid">
          {initialAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {showDialog && <NewAgentDialog onClose={handleClose} />}
    </div>
  );
}