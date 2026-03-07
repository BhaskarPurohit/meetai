"use client";

import { useState, useTransition } from "react";
import { createAgent } from "@/modules/agents/server/actions";
import { PROMPTS } from "@/lib/openai";

type Persona = "scribe" | "devil_advocate" | "timekeeper" | "decision_tracker" | "custom";

const PERSONAS: { value: Persona; label: string; prompt: string }[] = [
  { value: "scribe", label: "Scribe", prompt: PROMPTS.AGENT_PERSONAS.scribe },
  { value: "devil_advocate", label: "Devil's Advocate", prompt: PROMPTS.AGENT_PERSONAS.devil_advocate },
  { value: "timekeeper", label: "Timekeeper", prompt: PROMPTS.AGENT_PERSONAS.timekeeper },
  { value: "decision_tracker", label: "Decision Tracker", prompt: PROMPTS.AGENT_PERSONAS.decision_tracker },
  { value: "custom", label: "Custom", prompt: "" },
];

export function NewAgentDialog({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [persona, setPersona] = useState<Persona>("scribe");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(PROMPTS.AGENT_PERSONAS.scribe);

  const handlePersonaChange = (p: Persona) => {
    setPersona(p);
    const found = PERSONAS.find((x) => x.value === p);
    if (found && found.prompt) setSystemPrompt(found.prompt);
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
        onClose();
      } catch {
        setError("Failed to create agent. Please try again.");
      }
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">New Agent</h2>
          <button className="dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-body">
          <div className="field">
            <label className="field-label">Agent Name</label>
            <input
              className="field-input"
              placeholder="e.g. Sprint Scribe"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <span className="btn-spinner" /> : null}
            {isPending ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}