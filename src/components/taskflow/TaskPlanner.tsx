import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { planTasks, type PlannerResult } from "@/lib/ai.functions";
import { SensitiveWarning } from "./SensitiveWarning";
import { scanSensitive } from "@/lib/sensitive";

const QUADRANTS = [
  { key: "urgentImportant", title: "Do now", subtitle: "Urgent + Important", tone: "border-destructive/40" },
  { key: "notUrgentImportant", title: "Schedule", subtitle: "Not urgent + Important", tone: "border-primary/40" },
  { key: "urgentNotImportant", title: "Delegate", subtitle: "Urgent + Not important", tone: "border-warning/50" },
  { key: "notUrgentNotImportant", title: "Drop", subtitle: "Neither", tone: "border-border" },
] as const;

export function TaskPlanner() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);

  const submit = async () => {
    if (!tasks.trim()) {
      toast.error("List a few tasks first.");
      return;
    }
    if (scanSensitive(tasks).length > 0) {
      toast.error("Remove the flagged sensitive content before generating.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { tasks, hoursPerDay: hours } }));
      toast.success("Plan generated — review before committing.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build a plan.");
    } finally {
      setLoading(false);
    }
  };

  const totalHours = result ? result.schedule.reduce((sum, b) => sum + (b.hours || 0), 0) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <section className="panel h-fit space-y-4 p-5">
        <header>
          <h2 className="text-lg font-semibold">Task dump</h2>
          <p className="text-sm text-muted-foreground">Everything on your plate, deadlines included.</p>
        </header>
        <div className="space-y-2">
          <Label htmlFor="tasks">Unorganised tasks</Label>
          <Textarea
            id="tasks"
            className="min-h-[240px] resize-y"
            placeholder={"Finish budget deck (Thu)\nReply to vendor emails\nPrep 1:1 notes"}
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Hours available per day</Label>
            <span className="text-sm font-semibold text-primary">{hours}h</span>
          </div>
          <Slider min={1} max={12} step={1} value={[hours]} onValueChange={(v) => setHours(v[0] ?? hours)} />
        </div>
        <SensitiveWarning text={tasks} />
        <Button onClick={submit} disabled={loading} className="w-full">
          <Sparkle className="size-4" />
          {loading ? "Planning..." : "Build my day"}
        </Button>
      </section>

      <section className="space-y-6">
        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!loading && !result && (
          <div className="panel p-5 text-sm text-muted-foreground">
            Your Eisenhower matrix and time-blocked schedule will appear here.
          </div>
        )}

        {result && !loading && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {QUADRANTS.map((q) => (
                <div key={q.key} className={`panel border-2 p-4 ${q.tone}`}>
                  <h3 className="text-sm font-semibold">{q.title}</h3>
                  <p className="text-xs text-muted-foreground">{q.subtitle}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.matrix[q.key].length === 0 && (
                      <li className="text-xs text-muted-foreground">Nothing here.</li>
                    )}
                    {result.matrix[q.key].map((t, i) => (
                      <li key={i} className="rounded-md bg-muted px-2 py-1.5">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarClock className="size-4 text-primary" />
                  Time-blocked schedule
                </h3>
                <Badge variant={totalHours > hours ? "destructive" : "secondary"}>
                  {totalHours.toFixed(1)}h scheduled / {hours}h limit
                </Badge>
              </div>
              <div className="mt-4 overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.schedule.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {b.start} – {b.end}
                        </TableCell>
                        <TableCell>{b.task}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{b.focus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{b.hours}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {result.notes && (
                <p className="mt-3 text-sm text-muted-foreground">{result.notes}</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
