export default function MeetingDetailLoading() {
  return (
    <div className="meeting-detail-page">
      <div className="meeting-detail">
        {/* Header */}
        <div className="meeting-detail-header">
          <div className="skeleton" style={{ height: 28, width: "45%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "30%", borderRadius: 6, marginTop: 8 }} />
        </div>

        {/* Summary card */}
        <div className="intel-card">
          <div className="skeleton" style={{ height: 16, width: 80, borderRadius: 6, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 6 }} />
        </div>

        {/* Action items + decisions row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[0, 1].map((i) => (
            <div key={i} className="intel-card">
              <div className="skeleton" style={{ height: 16, width: 100, borderRadius: 6, marginBottom: 12 }} />
              {[0, 1, 2].map((j) => (
                <div key={j} className="skeleton" style={{ height: 13, width: `${70 + j * 10}%`, borderRadius: 6, marginBottom: 8 }} />
              ))}
            </div>
          ))}
        </div>

        {/* Follow-up email card */}
        <div className="intel-card">
          <div className="skeleton" style={{ height: 16, width: 120, borderRadius: 6, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: "50%", borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
}
