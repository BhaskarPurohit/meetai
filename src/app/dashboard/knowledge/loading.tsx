export default function KnowledgeLoading() {
  return (
    <div className="knowledge-page">
      {/* Page header */}
      <div className="skeleton" style={{ height: 26, width: 160, borderRadius: 8 }} />

      {/* Search input */}
      <div className="skeleton" style={{ height: 44, borderRadius: 10 }} />

      {/* Result items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="meeting-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="skeleton" style={{ height: 14, width: "35%", borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 6 }} />
            </div>
            <div className="skeleton" style={{ height: 13, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 13, width: "80%", borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
