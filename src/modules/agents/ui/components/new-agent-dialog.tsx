"use client";

import { useState, useTransition } from "react";
import { createAgent } from "@/modules/agents/server/actions";
import { toast } from "sonner";

type Persona = "scribe" | "devil_advocate" | "timekeeper" | "decision_tracker" | "custom";

const PERSONA_PROMPTS: Record<Persona, string> = {
  scribe: `You are a meticulous meeting scribe. Your job is to capture everything important with precision. Focus on: exact decisions made, who said what, specific numbers and dates mentioned, and any commitments made. Be concise but complete.`,
  devil_advocate: `You are a constructive devil's advocate in this meeting. When you hear assumptions, plans, or decisions being made, gently challenge them with questions like "Have we considered...?" or "What happens if...?". Your goal is to help the team think critically, not to obstruct.`,
  timekeeper: `You are a timekeeper for this meeting. Monitor the discussion and provide gentle reminders when topics are running long. Suggest moving on when a point has been sufficiently discussed. Help the team stay on agenda and finish on time.`,
  decision_tracker: `You are a decision tracker. Your sole focus is identifying and logging every decision made in this meeting, no matter how small. When you detect a decision being made, clearly state: "Decision logged: [decision]". At the end, provide a clean list of all decisions made.`,
  custom: ``,
};

const PERSONAS: { value: Persona; label: string }[] = [
  { value: "scribe", label: "Scribe" },
  { value: "devil_advocate", label: "Devil's Advocate" },
  { value: "timekeeper", label: "Timekeeper" },
  { value: "decision_tracker", label: "Decision Tracker" },
  { value: "custom", label: "Custom" },
];

export function NewAgentDialog({ onClose }: { onClose: (created?: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [persona, setPersona] = useState<Persona>("scribe");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(PERSONA_PROMPTS.scribe);

  const handlePersonaChange = (p: Persona) => {
    setPersona(p);
    if (PERSONA_PROMPTS[p]) setSystemPrompt(PERSONA_PROMPTS[p]);
  };

  const handleSubmit = () => {
    if (!name.trim() || !systemPrompt.trim()) {
      setError("Name and system prompt are required.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await createAgent({ name, persona, systemPrompt, description });
        toast.success("Agent created");
        onClose(true);
      } catch {
        setError("Failed to create agent. Please try again.");
        toast.error("Failed to create agent");
      }
    });
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose()}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">New Agent</h2>
          <button className="dialog-close" onClick={() => onClose()}>✕</button>
        </div>

        <div className="dialog-body">
          <div className="field">
            <label className="field-label">Agent Name</label>
            <input
              className="field-input"
              placeholder="e.g. Sprint Scribe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Persona</label>
            <div className="persona-grid">
              {PERSONAS.map((p) => (
                <button
                  key={p.value}
                  className={`persona-btn ${persona === p.value ? "active" : ""}`}
                  onClick={() => handlePersonaChange(p.value)}
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Description (optional)</label>
            <input
              className="field-input"
              placeholder="What does this agent do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">System Prompt</label>
            <textarea
              className="field-input field-textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              placeholder="Instructions for the AI agent..."
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={() => onClose()}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <span className="btn-spinner" /> : null}
            {isPending ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}