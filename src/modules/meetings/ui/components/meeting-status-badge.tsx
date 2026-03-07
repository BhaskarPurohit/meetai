type Status = "upcoming" | "active" | "completed" | "cancelled";

const STATUS_META: Record<Status, { label: string; color: string }> = {
  upcoming:  { label: "Upcoming",  color: "#6366f1" },
  active:    { label: "Live",      color: "#10b981" },
  completed: { label: "Completed", color: "#a0a4bc" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
};

export function MeetingStatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="status-badge"
      style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
    >
      {status === "active" && <span className="status-live-dot" style={{ background: meta.color }} />}
      {meta.label}
    </span>
  );
}