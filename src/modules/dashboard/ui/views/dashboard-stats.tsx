import { getDashboardStats } from "@/modules/meetings/server/queries";

export async function DashboardStats({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);

  const items = [
    { label: "Total Meetings", value: stats.totalMeetings, icon: "▶", color: "#6366f1" },
    { label: "Open Actions", value: stats.openActionItems, icon: "◉", color: "#10b981" },
    { label: "Active Agents", value: stats.activeAgents, icon: "◈", color: "#f59e0b" },
    { label: "Knowledge Chunks", value: stats.knowledgeChunks, icon: "◆", color: "#8b5cf6" },
  ];

  return (
    <div className="stats-row">
      {items.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <div
            className="stat-icon"
            style={{ color: stat.color, background: `${stat.color}15` }}
          >
            {stat.icon}
          </div>
          <div className="stat-body">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}