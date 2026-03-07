"use client";

import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Meetings", description: "Schedule, join, and review your meetings" },
  "/dashboard/agents": { title: "AI Agents", description: "Configure agents for your meetings" },
  "/dashboard/knowledge": { title: "Knowledge Base", description: "Search across all your meeting history" },
  "/dashboard/settings": { title: "Settings", description: "Manage your account and integrations" },
};

export function DashboardTopbar({ user: _ }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const page = PAGE_TITLES[pathname] ?? PAGE_TITLES["/dashboard"];

  const handleNew = () => {
    if (pathname === "/dashboard/agents") {
      router.push("/dashboard/agents?new=1");
    } else {
      router.push("/dashboard?new=1");
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{page.title}</h1>
        <p className="topbar-desc">{page.description}</p>
      </div>
      <div className="topbar-right">
        <button className="topbar-new-btn" onClick={handleNew}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {pathname === "/dashboard/agents" ? "New Agent" : "New Meeting"}
        </button>
      </div>
    </header>
  );
}