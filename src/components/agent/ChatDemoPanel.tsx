"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type ToolCall = { name: string; input: unknown; output: unknown };

const TOOL_LABELS: Record<string, string> = {
  search_devices: "Searching the live product catalog",
  get_troubleshooting_steps: "Checking troubleshooting knowledge base",
};

export function ChatDemoPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the Haven Home Tech support assistant. Ask me to recommend a device, or describe a problem you're running into.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastToolCalls, setLastToolCalls] = useState<ToolCall[]>([]);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, lastToolCalls]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError("");
    setLastToolCalls([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setLastToolCalls(data.toolCalls ?? []);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the chat backend.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[480px] flex-col rounded-2xl border border-neutral-200 bg-white">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "assistant"
                ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-700"
                : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white"
            }
            style={m.role === "user" ? { backgroundColor: "#146EF5" } : undefined}
          >
            {m.content}
          </div>
        ))}

        {sending && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-400">
            Thinking…
          </div>
        )}

        {lastToolCalls.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Behind the scenes
            </p>
            <ul className="flex flex-col gap-1.5">
              {lastToolCalls.map((call, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="text-emerald-500">✓</span>
                  <span>{TOOL_LABELS[call.name] ?? call.name} — completed</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-neutral-200 p-4"
      >
        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Ask about a device, or describe a problem…"
            className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition disabled:bg-neutral-200 disabled:text-neutral-400"
            style={!sending && input.trim() ? { backgroundColor: "#146EF5" } : undefined}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
