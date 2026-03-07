export default function DashboardLoading() {
  return (
    <div className="meetings-page">
      <div className="stats-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <div className="stat-body">
              <div className="skeleton" style={{ width: 40, height: 24, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="meetings-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="meeting-card">
            <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: "70%", height: 20, borderRadius: 6, marginTop: 8 }} />
            <div className="skeleton" style={{ width: "40%", height: 14, borderRadius: 6, marginTop: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}