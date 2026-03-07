
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUp.email({ name, email, password });
      router.push("/");
    } catch {
      setError("Could not create account. Email may already be in use.");
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
              Your meetings,<br />
              <span className="auth-headline-accent">finally productive.</span>
            </h1>
            <p className="auth-subline">
              Join teams who never lose track of decisions, action items,
              or context from their meetings again.
            </p>
          </div>
          <div className="auth-stats">
            {[
              { value: "2 min", label: "avg setup time" },
              { value: "100%", label: "meetings captured" },
              { value: "0", label: "notes to take" },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
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
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-sub">Free to start. No credit card required.</p>
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

          <form onSubmit={handleSignUp} className="auth-form">
            <div className="field">
              <label className="field-label" htmlFor="name">Full name</label>
              <input id="name" type="text" className="field-input" placeholder="Bhaskar Purohit"
                value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="email">Work email</label>
              <input id="email" type="email" className="field-input" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="field-input" placeholder="Min. 8 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading || googleLoading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Creating account..." : "Create account"}
            </button>
            <p className="auth-terms">
              By creating an account you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="auth-switch-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
