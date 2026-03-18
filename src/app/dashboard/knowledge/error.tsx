"use client";

import { useEffect } from "react";

export default function KnowledgeError({
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
    <div className="knowledge-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 12, textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--meetai-error)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Error</div>
      <h2 className="notfound-title">Failed to load knowledge base</h2>
      <p className="notfound-desc">{error.message ?? "The knowledge base could not be loaded."}</p>
      <button
        className="btn-primary"
        onClick={reset}
        style={{ border: "none", cursor: "pointer", padding: "10px 20px", borderRadius: 10, fontSize: 14 }}
      >
        Try again
      </button>
    </div>
  );
}
