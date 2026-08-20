import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Mail, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail, type EmailResult } from "@/lib/ai.functions";
import { SensitiveWarning } from "./SensitiveWarning";
import { scanSensitive } from "@/lib/sensitive";

const TONES = ["Formal", "Friendly", "Persuasive", "Assertive"] as const;

export function EmailGenerator() {
  const run = useServerFn(generateEmail);
  const [points, setPoints] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = async () => {
    if (!points.trim()) { toast.error("Add a few bullet points first."); return; }
    if (scanSensitive(`${points} ${recipient}`).length > 0)
      { toast.error("Remove the flagged sensitive content before generating."); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await run({ data: { points, recipient, tone } });
      setResult(res);
      setSubject(res.subjectOptions[0] ?? "");
      setBody(res.body);
      toast.success("Draft ready — review before sending.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate this email.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      toast.success("Email copied to clipboard.");
    } catch {
      toast.error("Clipboard access was blocked by your browser.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel space-y-4 p-5">
        <header>
          <h2 className="text-lg font-semibold">Email brief</h2>
          <p className="text-sm text-muted-foreground">What should this email say?</p>
        </header>
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            placeholder="e.g. Thandi, Head of Ops"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as (typeof TONES)[number])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Key bullet points</Label>
          <Textarea
            id="points"
            className="min-h-[220px] resize-y"
            placeholder={"- Project slipped by 3 days\n- Need sign-off by Friday"}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </div>
        <SensitiveWarning text={`${points}\n${recipient}`} />
        <Button onClick={submit} disabled={loading} className="w-full">
          <Sparkle className="size-4" />
          {loading ? "Drafting..." : "Generate draft"}
        </Button>
      </section>

      <section className="panel space-y-4 p-5">
        <header className="flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Draft</h2>
        </header>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!loading && !result && (
          <p className="text-sm text-muted-foreground">
            Subject line options and an editable draft will appear here.
          </p>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject line options</Label>
              {result.subjectOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    subject === s
                      ? "border-primary bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Email body (editable)</Label>
              <Textarea
                id="body"
                className="min-h-[300px] resize-y font-sans text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={copy} className="w-full">
              <Copy className="size-4" />
              Copy to clipboard
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
