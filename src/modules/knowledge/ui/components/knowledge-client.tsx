"use client";

import { useState, useTransition } from "react";

interface SearchResult {
  id: string;
  meetingId: string;
  content: string;
  similarity: number;
  meeting?: { name: string; createdAt: string } | null;
}

export function KnowledgeClient({ userId: _ }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/knowledge/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      }
    });
  };

  return (
    <div className="knowledge-page">
      <div className="knowledge-search-box">
        <div className="knowledge-search-inner">
          <svg className="knowledge-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="knowledge-search-input"
            placeholder="Search your meeting history..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="knowledge-search-btn"
            onClick={handleSearch}
            disabled={isPending || !query.trim()}
          >
            {isPending ? "Searching..." : "Search"}
          </button>
        </div>
        <p className="knowledge-search-hint">
          Ask anything about your past meetings — decisions, action items, topics discussed.
        </p>
      </div>

      {isPending && (
        <div className="knowledge-loading">
          <div className="intel-processing-spinner" />
          <p>Searching knowledge base...</p>
        </div>
      )}

      {!isPending && searched && results.length === 0 && (
        <div className="empty-state">
          <h3 className="empty-title">No results found</h3>
          <p className="empty-desc">
            Try different keywords, or complete more meetings to build your knowledge base.
          </p>
        </div>
      )}

      {!isPending && results.length > 0 && (
        <div className="knowledge-results">
          <p className="knowledge-results-count">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          <div className="knowledge-results-list">
            {results.map((r) => (
              <div key={r.id} className="knowledge-result-card">
                <div className="knowledge-result-header">
                  <span className="knowledge-result-meeting">
                    {r.meeting?.name ?? "Unknown meeting"}
                  </span>
                  <span className="knowledge-result-score">
                    {Math.round(r.similarity * 100)}% match
                  </span>
                </div>
                <p className="knowledge-result-content">{r.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searched && !isPending && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="22" cy="22" r="12" stroke="#2a2e4a" strokeWidth="2"/>
              <path d="M31 31l8 8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 22h8M22 18v8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="empty-title">Search your knowledge base</h3>
          <p className="empty-desc">
            Every completed meeting is indexed. Search by topic, decision, or any keyword.
          </p>
        </div>
      )}
    </div>
  );
}