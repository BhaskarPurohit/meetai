
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
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-sub">Free to start. No credit card required.</p>
          </div>

          <button
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            type="button"
          >
            {googleLoading ? (
              <span className="btn-spinner" />
            ) : (
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
              <input
                id="name"
                type="text"
                className="field-input"
                placeholder="Bhaskar Purohit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || googleLoading}
            >
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
            <a href="/sign-in" className="auth-switch-link">Sign in</a>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          display: flex;
          min-height: 100vh;
          background: #0c0e14;
          font-family: 'DM Sans', sans-serif;
        }

        .auth-left {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          overflow: hidden;
          border-right: 1px solid #1e2235;
        }
        @media (max-width: 768px) { .auth-left { display: none; } }

        .auth-left-inner { position: relative; z-index: 2; max-width: 440px; width: 100%; }

        .auth-left-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          z-index: 0;
        }
        .auth-left-glow {
          position: absolute; top: -100px; right: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          z-index: 1;
        }

        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 64px; }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #e8eaf0; letter-spacing: -0.02em;
        }

        .auth-left-copy { margin-bottom: 48px; }
        .auth-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 3.5vw, 44px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.03em; color: #e8eaf0;
          margin: 0 0 16px;
        }
        .auth-headline-accent {
          background: linear-gradient(135deg, #6366f1, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-subline { font-size: 15px; color: #6b7280; line-height: 1.7; margin: 0; max-width: 360px; }

        .auth-stats { display: flex; gap: 32px; }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #e8eaf0; letter-spacing: -0.02em;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label { font-size: 12px; color: #5c6080; text-transform: uppercase; letter-spacing: 0.05em; }

        .auth-right {
          width: 480px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
        }
        @media (max-width: 768px) { .auth-right { width: 100%; padding: 32px 24px; } }

        .auth-form-wrap { width: 100%; max-width: 360px; }
        .auth-form-header { margin-bottom: 28px; }
        .auth-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 700;
          color: #e8eaf0; margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .auth-form-sub { font-size: 14px; color: #5c6080; margin: 0; }

        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 11px 16px;
          background: #13151f; border: 1px solid #1e2235; border-radius: 10px;
          color: #e8eaf0; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .btn-google:hover:not(:disabled) { border-color: #2a2e4a; background: #1a1d2e; }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: #1e2235; }
        .auth-divider-text { font-size: 12px; color: #3a3d55; }

        .auth-form { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 12px; font-weight: 500; color: #a0a4bc;
          letter-spacing: 0.03em; text-transform: uppercase;
        }
        .field-input {
          width: 100%; padding: 10px 14px;
          background: #13151f; border: 1px solid #1e2235;
          border-radius: 10px; color: #e8eaf0;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s; outline: none;
        }
        .field-input::placeholder { color: #3a3d55; }
        .field-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

        .auth-error {
          padding: 10px 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; font-size: 13px; color: #ef4444;
        }

        .btn-primary {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 11px 16px;
          background: #6366f1; border: none; border-radius: 10px;
          color: white; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover:not(:disabled) { background: #4f46e5; }
        .btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-terms {
          font-size: 11px; color: #3a3d55;
          text-align: center; line-height: 1.6; margin: 0;
        }
        .auth-terms a { color: #5c6080; text-decoration: none; }
        .auth-terms a:hover { color: #6366f1; }

        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch { text-align: center; font-size: 13px; color: #5c6080; margin-top: 24px; }
        .auth-switch-link { color: #6366f1; text-decoration: none; font-weight: 500; }
        .auth-switch-link:hover { color: #8b5cf6; }
      `}</style>
    </div>
  );
}
