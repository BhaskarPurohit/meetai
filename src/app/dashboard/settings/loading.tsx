export default function SettingsLoading() {
  return (
    <div className="settings-page">
      {/* Section header */}
      <div className="skeleton" style={{ height: 22, width: 140, borderRadius: 8 }} />

      {/* Profile card */}
      <div className="meeting-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Avatar + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 18, width: "50%", borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "65%", borderRadius: 6 }} />
          </div>
        </div>

        {/* Field rows */}
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton" style={{ height: 13, width: 60, borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
          </div>
        ))}
      </div>

      {/* Integrations section header */}
      <div className="skeleton" style={{ height: 22, width: 120, borderRadius: 8 }} />

      {/* Integration rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="meeting-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div>
              <div className="skeleton" style={{ height: 15, width: 80, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: 120, borderRadius: 4 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 32, width: 90, borderRadius: 8 }} />
        </div>
      ))}
    </div>
  );
}
