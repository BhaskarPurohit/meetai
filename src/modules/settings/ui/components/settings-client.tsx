"use client";

import { useState, useTransition } from "react";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/db/schema";

const INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    description: "Post meeting summaries and action items to a Slack channel automatically.",
    icon: "💬",
    color: "#4a154b",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync meeting notes and action items to a Notion database.",
    icon: "📝",
    color: "#000000",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Auto-create meetings from calendar events.",
    icon: "📅",
    color: "#1a73e8",
  },
];

export function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="settings-page">
      {/* Profile section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-profile">
            <div className="settings-avatar">{initials}</div>
            <div className="settings-profile-info">
              <p className="settings-profile-name">{user.name}</p>
              <p className="settings-profile-email">{user.email}</p>
              <p className="settings-profile-joined">
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="settings-section">
        <h2 className="settings-section-title">Integrations</h2>
        <div className="settings-integrations">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className="settings-card settings-integration-card">
              <div className="settings-integration-left">
                <div
                  className="settings-integration-icon"
                  style={{ background: `${integration.color}18` }}
                >
                  {integration.icon}
                </div>
                <div className="settings-integration-info">
                  <p className="settings-integration-name">{integration.name}</p>
                  <p className="settings-integration-desc">{integration.description}</p>
                </div>
              </div>
              <button className="settings-connect-btn" disabled>
                Coming soon
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="settings-section">
        <h2 className="settings-section-title settings-danger-title">Account</h2>
        <div className="settings-card">
          <div className="settings-danger-row">
            <div>
              <p className="settings-danger-label">Sign out</p>
              <p className="settings-danger-sub">Sign out of your MeetAI account on this device.</p>
            </div>
            <button
              className="settings-signout-btn"
              disabled={signingOut}
              onClick={() =>
                startSignOut(async () => {
                  await signOut();
                  router.push("/auth/sign-in");
                })
              }
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}