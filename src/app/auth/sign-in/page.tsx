
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn.email({ email, password });
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn.social({ provider: "google", callbackURL: "/" });
    } catch {
      setError("Google sign-in failed. Try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#6366f1" />
                <path d="M8 9h12M8 14h8M8 19h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="21" cy="19" r="3" fill="#10b981" />
              </svg>
            </div>
            <span className="brand-name">MeetAI</span>
          </div>
          <div className="auth-left-copy">
            <h1 className="auth-headline">
              Every meeting,<br />
              <span className="auth-headline-accent">intelligently captured.</span>
            </h1>
            <p className="auth-subline">
              AI agents that listen, summarize, extract action items,
              and build your team&apos;s knowledge base — automatically.
            </p>
          </div>
          <div className="auth-features">
            {[
              { icon: "◈", text: "Automatic meeting summaries" },
              { icon: "◈", text: "Action item extraction" },
              { icon: "◈", text: "Searchable knowledge base" },
              { icon: "◈", text: "Slack & Notion integrations" },
            ].map((f) => (
              <div className="auth-feature-item" key={f.text}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-grid" aria-hidden />
        <div className="auth-left-glow" aria-hidden />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your workspace</p>
          </div>

          <button className="btn-google" onClick={handleGoogleSignIn} disabled={googleLoading || loading} type="button">
            {googleLoading ? <span className="btn-spinner" /> : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            <span>{googleLoading ? "Redirecting..." : "Continue with Google"}</span>
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <span className="auth-divider-line" />
          </div>

          <form onSubmit={handleEmailSignIn} className="auth-form">
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field-input" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="field">
              <div className="field-label-row">
                <label className="field-label" htmlFor="password">Password</label>
                <a href="#" className="field-forgot">Forgot password?</a>
              </div>
              <input id="password" type="password" className="field-input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading || googleLoading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <a href="/auth/sign-up" className="auth-switch-link">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
