"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

interface SearchResult {
  id: string;
  content: string;
  meeting_id: string;
  meeting_name: string;
  meeting_date: string;
  similarity: number;
}

export function KnowledgeClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
      const data = await res.json() as { results: SearchResult[] };
      setResults(data.results ?? []);
      setSearched(true);
    });
  };

  return (
    <div className="knowledge-page">
      <div className="knowledge-search-box">
        <svg className="knowledge-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="knowledge-search-input"
          placeholder="Ask anything about your meetings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          autoFocus
        />
        <button
          className="knowledge-search-btn"
          onClick={handleSearch}
          disabled={isPending || !query.trim()}
        >
          {isPending ? <span className="btn-spinner" style={{ width: 14, height: 14 }} /> : "Search"}
        </button>
      </div>

      {!searched && (
        <div className="knowledge-empty">
          <div className="knowledge-empty-icon">◆</div>
          <p className="knowledge-empty-title">Search your meeting history</p>
          <p className="knowledge-empty-desc">
            Ask questions in plain English — semantically searches all transcripts.
          </p>
          <div className="knowledge-examples">
            {[
              "What decisions were made about the product roadmap?",
              "Who owns the API integration task?",
              "What was discussed in the last sprint retrospective?",
            ].map((ex) => (
              <button
                key={ex}
                className="knowledge-example-btn"
                onClick={() => { setQuery(ex); }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="knowledge-no-results">
          <p className="empty-title">No results found</p>
          <p className="empty-desc">Try a different query or add more meetings.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="knowledge-results">
          <p className="knowledge-results-count">{results.length} results for "{query}"</p>
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/meetings/${r.meeting_id}`}
              className="knowledge-result-card"
            >
              <div className="knowledge-result-header">
                <span className="knowledge-result-meeting">{r.meeting_name}</span>
                <span className="knowledge-result-score">
                  {Math.round(r.similarity * 100)}% match
                </span>
              </div>
              <p className="knowledge-result-content">{r.content}</p>
              <p className="knowledge-result-date">
                {new Date(r.meeting_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}