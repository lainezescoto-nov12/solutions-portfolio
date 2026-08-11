"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type ToolCall = { name: string; input: unknown; output: unknown; label: string };

const SHOPIFY_STORE_URL = "https://haven-home-tech.myshopify.com";

// Several phrasings per tool so "Behind the scenes" doesn't read like a
// robotic fixed label every time -- picked once per tool call, not
// re-randomized on every render.
const TOOL_LABEL_VARIANTS: Record<string, string[]> = {
  search_devices: [
    "Searching the live Shopify catalog",
    "Checking real-time inventory",
    "Looking up matching products in the store",
  ],
  get_troubleshooting_steps: [
    "Retrieving answers from the KB",
    "Pulling troubleshooting steps from the knowledge base",
    "Checking the KB for a fix",
  ],
  get_policy_answer: [
    "Retrieving answers from the KB",
    "Checking policy details in the knowledge base",
    "Looking up the KB for policy info",
  ],
};

function pickToolLabel(name: string): string {
  const variants = TOOL_LABEL_VARIANTS[name];
  if (!variants) return name;
  return variants[Math.floor(Math.random() * variants.length)];
}

// Browser-native speech-to-text/text-to-speech, not a second ElevenLabs
// voice agent -- a spoken message is sent straight through as a chat
// bubble (never staged in the text input), and once voice mode is on,
// replies are read aloud too (via ElevenLabs TTS, see /api/tts). Still
// the same Claude tool-calling backend underneath, no parallel voice
// pipeline.
//
// Honest limitation: the Web Speech API has to be told which language to
// listen for -- it can't detect Spanish vs English from audio the way a
// server-side pipeline can. Recognition defaults to the browser's own
// language setting. Typed messages remain fully bilingual via the system
// prompt regardless.
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

function WaveformIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12h2l2-6 3 14 3-11 2 7 2-4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
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
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {!muted ? (
        <path
          d="M17 8a6 6 0 0 1 0 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function ChatDemoPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm Haven AI Support Agent. Ask me to recommend a device, or describe a problem you're running into.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastToolCalls, setLastToolCalls] = useState<ToolCall[]>([]);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [voiceModeOn, setVoiceModeOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function speak(text: string) {
    if (muted) return;
    try {
      audioRef.current?.pause();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return; // voice is a bonus on top of the text reply already shown -- fail silently
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.play();
    } catch {
      // same -- text reply already landed, don't surface a voice-playback error
    }
  }

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

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function startListening() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setVoiceModeOn(true);
        send(transcript, true);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function handleMicClick() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    // Not yet in voice mode -- this tap is "switch to voice mode."
    // Already in voice mode -- start listening for the next voice turn.
    startListening();
  }

  async function send(text: string, spoken = false) {
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
      const calls: ToolCall[] = (data.toolCalls ?? []).map(
        (c: { name: string; input: unknown; output: unknown }) => ({
          ...c,
          label: pickToolLabel(c.name),
        })
      );
      setLastToolCalls(calls);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (voiceModeOn || spoken) speak(data.reply);
    } catch {
      setError("Couldn't reach the chat backend.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/60">
      <div className="flex items-center justify-between gap-2.5 border-b border-neutral-200 bg-neutral-950 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Image
            src="/haven-home-tech-logo.png"
            alt="Haven AI Support Agent"
            width={30}
            height={30}
            className="rounded-full ring-2 ring-white/20"
          />
          <div>
            <p className="text-sm font-semibold text-white">Haven AI Support Agent</p>
            <a
              href={SHOPIFY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white/50 hover:text-white/80"
            >
              Connected to a live Shopify store ↗
            </a>
          </div>
        </div>
        {voiceModeOn && (
          <button
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              setMuted((m) => !m);
            }}
            aria-label={muted ? "Unmute voice replies" : "Mute voice replies"}
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-white/60 transition hover:text-white"
          >
            <SpeakerIcon muted={muted} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50/50 p-5">
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
                  ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200"
                  : "max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white shadow-sm"
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
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-neutral-400 shadow-sm ring-1 ring-neutral-200">
              Thinking…
            </div>
          </div>
        )}

        {lastToolCalls.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Behind the scenes
            </p>
            <ul className="flex flex-col gap-1.5">
              {lastToolCalls.map((call, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="text-emerald-500">✓</span>
                  <span>{call.label} — completed</span>
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
        className="border-t border-neutral-200 bg-white p-3.5"
      >
        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 transition focus-within:border-neutral-300 focus-within:bg-white">
          {micSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={sending}
              aria-label={
                listening ? "Stop recording" : voiceModeOn ? "Speak again" : "Switch to voice mode"
              }
              title={voiceModeOn ? "Speak again" : "Switch to voice mode"}
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-500 text-white"
                  : "bg-white text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {voiceModeOn ? <MicIcon /> : <WaveformIcon />}
            </button>
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
