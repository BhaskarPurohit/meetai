export default function AgentsLoading() {
  return (
    <div className="agents-page">
      {/* Page header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 36, width: 120, borderRadius: 10 }} />
      </div>

      {/* Agent cards grid */}
      <div className="meetings-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="meeting-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
              <div className="skeleton" style={{ height: 18, width: "55%", borderRadius: 6 }} />
            </div>
            <div className="skeleton" style={{ height: 13, width: "80%", borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 13, width: "60%", borderRadius: 6, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
