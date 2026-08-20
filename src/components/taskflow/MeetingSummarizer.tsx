import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";
import { SensitiveWarning } from "./SensitiveWarning";
import { scanSensitive } from "@/lib/sensitive";

const priorityVariant = (p: string) =>
  p === "High" ? "destructive" : p === "Medium" ? "default" : "secondary";

export function MeetingSummarizer() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MeetingResult | null>(null);

  const submit = async () => {
    if (!notes.trim()) { toast.error("Add some meeting notes first."); return; }
    if (scanSensitive(notes).length > 0)
      { toast.error("Remove the flagged sensitive content before generating."); return; }
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { notes, objective } }));
      toast.success("Meeting summarised — please review before sharing.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not summarise these notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-4 p-5">
        <header>
          <h2 className="text-lg font-semibold">Raw meeting input</h2>
          <p className="text-sm text-muted-foreground">Paste a transcript or your rough notes.</p>
        </header>
        <div className="space-y-2">
          <Label htmlFor="objective">Meeting objective</Label>
          <Input
            id="objective"
            placeholder="e.g. Align on Q3 launch scope"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes / transcript</Label>
          <Textarea
            id="notes"
            className="min-h-[280px] resize-y"
            placeholder="Paste raw notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <SensitiveWarning text={`${notes}\n${objective}`} />
        <Button onClick={submit} disabled={loading} className="w-full">
          <Sparkle className="size-4" />
          {loading ? "Summarising..." : "Summarise meeting"}
        </Button>
      </section>

      <section className="panel space-y-5 p-5">
        <header className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Structured output</h2>
        </header>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {!loading && !result && (
          <p className="text-sm text-muted-foreground">
            Your executive summary, decisions and action items will appear here.
          </p>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Executive summary
              </h3>
              <p className="mt-2 text-sm leading-relaxed">{result.executiveSummary}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Key decisions
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {result.keyDecisions.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Action items
              </h3>
              <div className="mt-2 overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.actionItems.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{a.owner}</TableCell>
                        <TableCell>{a.task}</TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant(a.priority)}>{a.priority}</Badge>
                        </TableCell>
                        <TableCell>{a.deadline}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
