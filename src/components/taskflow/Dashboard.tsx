import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Sparkle,
} from "lucide-react";

type LaunchTab = "meeting" | "email" | "planner" | "chat";

const KPIS = [
  { label: "Meetings Processed", value: "18", hint: "+4 this week", icon: ClipboardList },
  { label: "Emails Drafted", value: "34", hint: "Top tone: Formal", icon: Mail },
  { label: "Active Tasks", value: "8", hint: "3 due today", icon: CalendarClock },
  { label: "AI Guardrails", value: "100% Active", hint: "Sensitive-data scanning on", icon: ShieldCheck },
] as const;

const ACTIONS: { id: LaunchTab; label: string; desc: string; icon: typeof Mail }[] = [
  { id: "meeting", label: "Summarize Meeting", desc: "Turn raw notes into decisions", icon: ClipboardList },
  { id: "email", label: "Draft Email", desc: "Subject lines and a full draft", icon: Mail },
  { id: "planner", label: "Plan Tasks", desc: "Eisenhower matrix and schedule", icon: CalendarClock },
  { id: "chat", label: "Chat Assistant", desc: "Ask anything about your work", icon: MessagesSquare },
];

const ACTIVITY = [
  { title: "Meeting summary generated", detail: "Q3 Ops sync — 5 action items", time: "12 min ago" },
  { title: "Email drafted", detail: "Formal tone — vendor renewal", time: "48 min ago" },
  { title: "Daily plan created", detail: "6 hour limit — 4 focus blocks", time: "2 hours ago" },
  { title: "Assistant conversation", detail: "Prioritised tomorrow's follow-ups", time: "Yesterday" },
];

const INITIAL_FOCUS = [
  { id: 1, text: "Send Q3 status update to leadership", done: false },
  { id: 2, text: "Review vendor renewal draft", done: true },
  { id: 3, text: "Confirm sign-off deadline with Thandi", done: false },
  { id: 4, text: "Block 90 minutes for roadmap writing", done: false },
];

export function Dashboard({ onNavigate }: { onNavigate: (tab: LaunchTab) => void }) {
  const [focus, setFocus] = useState(INITIAL_FOCUS);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="panel flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold">Welcome to TaskFlow AI Operations</h2>
          <p className="text-sm text-muted-foreground">
            Your AI workspace at a glance — outputs always need a human check.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            <CalendarDays className="size-3.5 text-primary" />
            {today}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-3 py-1.5 text-xs font-medium text-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            Responsible AI active
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          const isGuard = k.label === "AI Guardrails";
          return (
            <div key={k.label} className="panel space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <Icon className={`size-4 ${isGuard ? "text-success" : "text-primary"}`} />
              </div>
              <p className="font-display text-2xl font-semibold">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.hint}</p>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Quick actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => onNavigate(a.id)}
                className="panel group space-y-3 p-5 text-left transition-colors hover:bg-muted"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </div>
                <p className="font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel space-y-4 p-5">
          <header className="flex items-center gap-2">
            <Sparkle className="size-4 text-primary" />
            <h3 className="text-lg font-semibold">Recent AI activity</h3>
          </header>
          <ol className="relative space-y-5 border-l pl-5">
            {ACTIVITY.map((a) => (
              <li key={a.title} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="panel space-y-4 p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <h3 className="text-lg font-semibold">Today's focus tasks</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {focus.filter((f) => f.done).length}/{focus.length} done
            </span>
          </header>
          <ul className="space-y-2">
            {focus.map((f) => (
              <li key={f.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={f.done}
                    onChange={() =>
                      setFocus((prev) =>
                        prev.map((t) => (t.id === f.id ? { ...t, done: !t.done } : t)),
                      )
                    }
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  <span className={f.done ? "text-muted-foreground line-through" : ""}>{f.text}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
