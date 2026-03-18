"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="notfound-root">
      <div className="notfound-inner">
        <div className="notfound-code" style={{ color: "var(--meetai-error)" }}>Error</div>
        <h1 className="notfound-title">Something went wrong</h1>
        <p className="notfound-desc">{error.message ?? "An unexpected error occurred."}</p>
        <button className="btn-primary" onClick={reset} style={{ border: "none", cursor: "pointer", padding: "10px 20px", borderRadius: 10, fontSize: 14 }}>
          Try again
        </button>
      </div>
    </div>
  );
}