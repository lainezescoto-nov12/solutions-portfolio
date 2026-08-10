"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type ToolCall = { name: string; input: unknown; output: unknown };

const TOOL_LABELS: Record<string, string> = {
  search_devices: "Searching the live product catalog",
  get_troubleshooting_steps: "Checking troubleshooting knowledge base",
  get_policy_answer: "Checking returns & warranty policy",
};

// Browser-native speech-to-text, not a second ElevenLabs voice agent --
// the mic transcribes into the same text input that already drives this
// chat, so it goes through the one existing backend rather than standing
// up a parallel voice pipeline. Web Speech API needs to be told which
// language to listen for up front (it can't auto-detect), hence the
// small EN/ES toggle next to it.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const MIC_LANGUAGES = [
  { code: "en-US", label: "EN" },
  { code: "es-ES", label: "ES" },
];

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
  const [micLang, setMicLang] = useState<"en-US" | "es-ES">("en-US");
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time browser-capability check on mount -- window/SpeechRecognition
    // isn't available during SSR, so this can't be a lazy useState initializer
    // without risking a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMicSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, lastToolCalls]);

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = micLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

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
      <div className="flex items-center gap-2.5 border-b border-neutral-200 px-5 py-3">
        <Image
          src="/haven-home-tech-logo.png"
          alt="Haven Home Tech"
          width={28}
          height={28}
          className="rounded-full"
        />
        <p className="text-sm font-semibold text-neutral-950">Haven Home Tech</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "assistant" ? "flex items-end gap-2" : "flex justify-end"}
          >
            {m.role === "assistant" && (
              <Image
                src="/haven-home-tech-logo.png"
                alt=""
                width={22}
                height={22}
                className="mb-1 flex-none rounded-full"
              />
            )}
            <div
              className={
                m.role === "assistant"
                  ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-700"
                  : "max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white"
              }
              style={m.role === "user" ? { backgroundColor: "#146EF5" } : undefined}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-end gap-2">
            <Image
              src="/haven-home-tech-logo.png"
              alt=""
              width={22}
              height={22}
              className="mb-1 flex-none rounded-full"
            />
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-400">
              Thinking…
            </div>
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
          {micSupported && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMic}
                disabled={sending}
                aria-label={listening ? "Stop recording" : "Start voice input"}
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full transition ${
                  listening
                    ? "bg-red-500 text-white"
                    : "bg-white text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M19 11a7 7 0 0 1-14 0M12 18v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="flex overflow-hidden rounded-full border border-neutral-200 text-[10px] font-semibold">
                {MIC_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setMicLang(l.code as "en-US" | "es-ES")}
                    className={`px-1.5 py-0.5 transition ${
                      micLang === l.code
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-400 hover:text-neutral-700"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={listening ? "Listening…" : "Ask about a device, or describe a problem…"}
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
