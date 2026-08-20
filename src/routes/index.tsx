import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/taskflow/ThemeToggle";
import { Dashboard as DashboardHome } from "@/components/taskflow/Dashboard";
import { MeetingSummarizer } from "@/components/taskflow/MeetingSummarizer";
import { EmailGenerator } from "@/components/taskflow/EmailGenerator";
import { TaskPlanner } from "@/components/taskflow/TaskPlanner";
import { Chatbot } from "@/components/taskflow/Chatbot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow AI — Workplace Productivity Dashboard" },
      {
        name: "description",
        content:
          "Summarise meetings, draft emails, plan your day and chat with an AI workplace assistant in one dashboard.",
      },
      { property: "og:title", content: "TaskFlow AI — Workplace Productivity Dashboard" },
      {
        property: "og:description",
        content:
          "AI meeting summaries, smart email drafts, Eisenhower task planning and a workplace assistant chatbot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "meeting", label: "Meeting Summarizer", icon: ClipboardList },
  { id: "email", label: "Smart Email Generator", icon: Mail },
  { id: "planner", label: "AI Task Planner", icon: CalendarClock },
  { id: "chat", label: "Workplace Assistant", icon: MessagesSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Dashboard() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r bg-sidebar transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </div>
          {!collapsed && (
            <span className="font-display text-base font-semibold text-sidebar-foreground">
              TaskFlow AI
            </span>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                title={t.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{t.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2 border-b border-warning/40 bg-warning/15 px-5 py-2.5 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            AI outputs are generated automatically and may contain inaccuracies. Human review is
            required before sending or scheduling.
          </p>
        </div>

        <header className="flex h-16 items-center justify-between gap-4 border-b px-5">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{active.label}</h1>
            <p className="truncate text-xs text-muted-foreground">TaskFlow AI workspace</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="surface-grid flex-1 p-5">
          {tab === "dashboard" && <DashboardHome onNavigate={setTab} />}
          {tab === "meeting" && <MeetingSummarizer />}
          {tab === "email" && <EmailGenerator />}
          {tab === "planner" && <TaskPlanner />}
          {tab === "chat" && <Chatbot />}
        </main>
      </div>
    </div>
  );
}
