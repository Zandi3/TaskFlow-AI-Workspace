import { ShieldAlert } from "lucide-react";
import { scanSensitive } from "@/lib/sensitive";

export function SensitiveWarning({ text }: { text: string }) {
  const hits = scanSensitive(text);
  if (hits.length === 0) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <ShieldAlert className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-semibold">Sensitive content detected — remove before sending to AI</p>
        <ul className="mt-1 list-disc pl-4">
          {hits.map((h) => (
            <li key={h.label}>{h.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
