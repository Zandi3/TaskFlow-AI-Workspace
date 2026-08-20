import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, SendHorizonal, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SensitiveWarning } from "./SensitiveWarning";
import { scanSensitive } from "@/lib/sensitive";

const STARTERS = ["Draft a status update", "Prioritize my day", "Summarize action items"];

export function Chatbot() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message || "The assistant is unavailable right now."),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    if (scanSensitive(value).length > 0) {
      toast.error("Remove the flagged sensitive content before sending.");
      return;
    }
    void sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="panel flex h-[calc(100vh-15rem)] min-h-[520px] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md space-y-4 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Bot className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">Workplace assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask about updates, priorities or follow-ups. Answers are AI generated — verify before acting.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
              {!isUser && (
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Bot className="size-4" />
                </div>
              )}
              {isUser ? (
                <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {text}
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-[85%] text-sm leading-relaxed [&_li]:my-1 [&_p]:my-2 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              )}
              {isUser && (
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="size-4" />
                </div>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <p className="animate-pulse text-sm text-muted-foreground">Thinking...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-3 border-t p-4">
        <SensitiveWarning text={input} />
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask the workplace assistant..."
            className="max-h-40 min-h-[52px] resize-none"
          />
          <Button size="icon" onClick={() => send(input)} disabled={busy || !input.trim()}>
            <SendHorizonal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
