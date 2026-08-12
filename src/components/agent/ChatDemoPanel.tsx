"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type DragEvent } from "react";

type ProductCard = { id: string; title: string; priceUsd: number; imageUrl: string | null };
// `image`, when present, is a data URL of a photo the customer attached
// (e.g. a damaged-item report) -- sent to /api/chat so Claude's vision can
// look at it directly, and also rendered as a thumbnail in the bubble.
type Message = { role: "user" | "assistant"; content: string; products?: ProductCard[]; image?: string };
type ToolCall = { name: string; input: unknown; output: unknown; label: string; detail: string };

// Pulls product cards (with real Shopify image URLs) out of a
// search_devices tool result so the reply can show an actual carousel
// instead of just describing the product in text.
function productCardsFromToolCalls(calls: { name: string; output: unknown }[]): ProductCard[] {
  const searchCall = calls.find((c) => c.name === "search_devices");
  if (!searchCall) return [];
  const output = searchCall.output as { found?: boolean; devices?: unknown[] } | undefined;
  if (!output?.found || !Array.isArray(output.devices)) return [];
  return output.devices.map((d) => {
    const device = d as { id: string; title: string; priceUsd: number; imageUrl: string | null };
    return { id: device.id, title: device.title, priceUsd: device.priceUsd, imageUrl: device.imageUrl };
  });
}

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

// Pulls a real detail out of the tool's actual output so this reads as
// live telemetry rather than a fixed decorative string -- e.g. how many
// products actually matched, which KB entry actually got used.
function toolResultDetail(name: string, output: unknown): string {
  const o = output as Record<string, unknown> | undefined;
  if (!o) return "";

  if (name === "search_devices") {
    if (o.found === false) return "no matches";
    const devices = Array.isArray(o.devices) ? o.devices : [];
    return `${devices.length} match${devices.length === 1 ? "" : "es"} found`;
  }
  if (name === "get_troubleshooting_steps") {
    if (o.found === false) return "no matching entry";
    return typeof o.issue === "string" ? `matched "${o.issue}"` : "matched";
  }
  if (name === "get_policy_answer") {
    if (o.found === false) return "no matching entry";
    return typeof o.matchedQuestion === "string" ? `matched "${o.matchedQuestion}"` : "matched";
  }
  return "";
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

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 12.5l6.5-6.5a3 3 0 0 1 4.24 4.24L11 18a5 5 0 0 1-7-7l7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Compact 3-bar equalizer for the voice-mode status circle -- reuses the
// same waveform-bar keyframe as the Ridgeline VoiceDemoPanel's full-size
// Waveform, just scaled down to fit inside a small round badge.
function MiniBars({ colorClassName }: { colorClassName: string }) {
  return (
    <div className="flex h-3 items-center justify-center gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full ${colorClassName}`}
          style={{
            height: "100%",
            animation: `waveform-bar ${0.5 + i * 0.15}s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
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

function ProductCarousel({ products }: { products: ProductCard[] }) {
  return (
    <div className="ml-8 flex gap-3 overflow-x-auto pb-1 pt-1">
      {products.map((p) => (
        <div
          key={p.id}
          className="w-36 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="relative h-24 w-full bg-neutral-100">
            {p.imageUrl ? (
              <Image src={p.imageUrl} alt={p.title} fill className="object-cover" sizes="144px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                No image
              </div>
            )}
          </div>
          <div className="p-2.5">
            <p className="line-clamp-2 text-xs font-medium text-neutral-800">{p.title}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-950">${p.priceUsd.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// The system prompt allows exactly one intentional markdown case: a
// **bolded** proactive offer (voice mode + replacement-or-refund) that
// should visually pop out of an otherwise plain-text bubble. This is not a
// general markdown renderer -- it only recognizes **bold**, plus turns raw
// http(s) URLs (e.g. a tracking link) into real clickable links, so an
// assistant reply can never accidentally slip other formatting past it.
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi, I'm Haven AI Support Agent. Ask me to recommend a device, or describe a problem you're running into.",
};

export function ChatDemoPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastToolCalls, setLastToolCalls] = useState<ToolCall[]>([]);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [voiceModeOn, setVoiceModeOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  // Same stale-closure problem messagesRef solves for `messages`: once
  // voice mode is chaining send() -> startListening() -> a new
  // recognition's onresult -> send() across turns, each of those
  // closures was captured at whatever render was active when it was
  // created, so a plain `pendingImage` read inside send() kept re-reading
  // whichever image was attached the FIRST time that closure chain was
  // built -- reattaching the same photo to every later voice message
  // even after it had already been sent and the UI showed no pending
  // photo. A ref always reads the live value regardless of which render's
  // closure is asking.
  const pendingImageRef = useRef<string | null>(null);
  function setPendingImageBoth(v: string | null) {
    pendingImageRef.current = v;
    setPendingImage(v);
  }
  const [dragActive, setDragActive] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Voice mode chains send() calls through recognition callbacks set up by
  // an earlier startListening() closure, so send() can't rely on the
  // `messages` state variable -- that closure's snapshot goes stale the
  // moment a later render updates it. This ref is mutated in place, so
  // every closure, however old, reads the live conversation.
  const messagesRef = useRef<Message[]>([INITIAL_MESSAGE]);
  // Voice mode is a real ongoing mode now (enter via waveform, exit only
  // via the X button), not a per-message toggle -- recognition callbacks
  // and the post-reply "resume listening" step run async, so they need a
  // value that's always current rather than whatever voiceModeOn was
  // when the closure was created.
  const voiceModeOnRef = useRef(false);
  // Guards send() against actually running twice for the same turn. The
  // `sending` state alone isn't enough: a typed submit and a stray voice
  // recognition result (mic stays hot for barge-in the whole time the AI
  // is talking, see startListening()) can both read a stale `sending`
  // closure as false in the same tick, both pass the guard, and both fire
  // -- producing two assistant replies with overlapping TTS playback. A
  // ref updates synchronously, so the second caller always sees the lock.
  const sendingRef = useRef(false);

  function setVoiceMode(on: boolean) {
    voiceModeOnRef.current = on;
    setVoiceModeOn(on);
  }

  // Resolves once playback actually finishes (not just once it starts) --
  // the caller needs to know when it's safe to start listening again
  // without the mic picking up the assistant's own voice.
  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (muted) {
        resolve();
        return;
      }
      setSpeaking(true);
      const finish = () => {
        setSpeaking(false);
        resolve();
      };
      (async () => {
        try {
          audioRef.current?.pause();
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error(`/api/tts failed (${res.status}):`, body);
            finish();
            return;
          }
          const blob = await res.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audioRef.current = audio;
          audio.onended = finish;
          audio.onerror = finish;
          await audio.play();
        } catch (err) {
          console.error("Voice playback failed:", err);
          finish();
        }
      })();
    });
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
    if (!voiceModeOnRef.current) return;
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    // A previous instance may still be technically alive here (its own
    // onend hasn't fired yet) if this call came from send()'s "listen
    // again" step right after a result -- detach its handlers before
    // replacing it so it can't also fire onresult/onend and trigger a
    // second, overlapping listen cycle.
    if (recognitionRef.current) {
      const prev = recognitionRef.current;
      prev.onresult = null;
      prev.onend = null;
      prev.onerror = null;
      try {
        prev.stop();
      } catch {
        // Already stopped/never started -- nothing to clean up.
      }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    let gotResult = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        gotResult = true;
        // Barge-in: the mic listens the whole time the AI is talking (see
        // send()), so if the user starts speaking mid-reply, cut the AI
        // off immediately instead of finishing its sentence over them.
        audioRef.current?.pause();
        setSpeaking(false);
        send(transcript);
      }
    };
    recognition.onend = () => {
      setListening(false);
      // Nothing was said this cycle (silence timeout) -- if still in
      // voice mode, keep listening instead of going quiet and waiting
      // for a click that voice mode isn't supposed to need anymore.
      if (!gotResult && voiceModeOnRef.current) {
        startListening();
      }
    };
    recognition.onerror = () => {
      setListening(false);
      if (voiceModeOnRef.current) startListening();
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch (err) {
      // Browsers can throw synchronously (InvalidStateError) if a new
      // recognition session starts before the previous one has fully torn
      // down its hold on the microphone -- this was the actual cause of
      // barge-in going dead: the auto-restart-on-silence-timeout cycle
      // (below) could fire mid-reply, throw here, and leave voice mode
      // silently listening to nothing for the rest of that turn. Retry
      // shortly instead of leaving it stuck.
      console.error("SpeechRecognition failed to start, retrying:", err);
      recognitionRef.current = null;
      setListening(false);
      if (voiceModeOnRef.current) setTimeout(startListening, 250);
    }
  }

  function enterVoiceMode() {
    setVoiceMode(true);
    startListening();
  }

  function exitVoiceMode() {
    recognitionRef.current?.stop();
    audioRef.current?.pause();
    setVoiceMode(false);
    setListening(false);
    setSpeaking(false);
  }

  function clearConversation() {
    audioRef.current?.pause();
    messagesRef.current = [INITIAL_MESSAGE];
    setMessages([INITIAL_MESSAGE]);
    setLastToolCalls([]);
    setError("");
    setInput("");
    setPendingImageBoth(null);
  }

  function handleImageSelect(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPendingImageBoth(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Counter, not a boolean, because dragging over child elements fires
  // enter/leave pairs on each of them too -- without counting, the overlay
  // would flicker off every time the pointer crosses a message bubble.
  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounterRef.current += 1;
    setDragActive(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setDragActive(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragActive(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    handleImageSelect(file);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    const attachedImage = pendingImageRef.current ?? undefined;
    if ((!trimmed && !attachedImage) || sendingRef.current) return;
    sendingRef.current = true;

    const nextMessages: Message[] = [
      ...messagesRef.current,
      { role: "user", content: trimmed, image: attachedImage },
    ];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    setPendingImageBoth(null);
    setSending(true);
    setError("");
    setLastToolCalls([]);

    try {
      // Every request resends the full conversation, and an attached photo
      // is a multi-MB base64 data URL -- keep it on only the newest
      // message. Older turns keep their image in local UI state (so the
      // thumbnail stays visible if you scroll back) but get stripped from
      // what's actually sent, once Claude has already looked at it, so the
      // payload doesn't keep growing every subsequent turn and eventually
      // 413 the request.
      const payloadMessages = nextMessages.map((m, i) =>
        m.image && i !== nextMessages.length - 1
          ? { ...m, image: undefined, content: m.content || "(shared a photo of the damage, already reviewed)" }
          : m
      );
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });
      if (!res.ok) {
        // A non-2xx (e.g. a 413 from an oversized payload) isn't
        // guaranteed to have a JSON body -- Vercel's own platform-level
        // error pages are plain text/HTML, and .json() would throw and
        // fall into the catch block below instead of here.
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Something went wrong (${res.status}).`);
        // Without this, a failed request left voice mode's mic dead until
        // the waveform was toggled off and back on -- resuming listening
        // on failure too means the customer can just try again by speaking.
        if (voiceModeOnRef.current) startListening();
        return;
      }
      const data = await res.json();
      const calls: ToolCall[] = (data.toolCalls ?? []).map(
        (c: { name: string; input: unknown; output: unknown }) => ({
          ...c,
          label: pickToolLabel(c.name),
          detail: toolResultDetail(c.name, c.output),
        })
      );
      setLastToolCalls(calls);
      const products = productCardsFromToolCalls(data.toolCalls ?? []);
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        products: products.length ? products : undefined,
      };
      messagesRef.current = [...messagesRef.current, assistantMessage];
      setMessages(messagesRef.current);
      // Voice mode is a real mode now -- every reply speaks while it's on,
      // whether that specific message was typed or spoken, same as a real
      // voice conversation. Only the X button turns it off.
      // Start listening immediately, in parallel with the reply speaking
      // (not awaited below) -- a real conversation lets you cut in, so the
      // mic doesn't sit idle until the AI finishes its sentence.
      if (voiceModeOnRef.current) {
        startListening();
        if (!muted) {
          // Strip the ** markers before TTS -- ElevenLabs would otherwise
          // read the literal asterisks aloud instead of just emphasizing.
          speak(data.reply.replace(/\*\*([^*]+)\*\*/g, "$1"));
        }
      }
    } catch {
      setError("Couldn't reach the chat backend.");
      if (voiceModeOnRef.current) startListening();
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-[calc(100vh-260px)] min-h-[640px] max-h-[820px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/60"
    >
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/90">
          <p className="text-sm font-medium text-blue-600">Drop the photo to attach it</p>
        </div>
      )}
      <div
        className="flex items-center justify-between gap-2.5 px-5 py-3.5"
        style={{ background: "linear-gradient(135deg, #146EF5 0%, #0a2472 100%)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white p-1.5 ring-2 ring-white/30">
            <Image
              src="/haven-home-tech-logo.png"
              alt="Haven AI Support Agent"
              width={26}
              height={26}
            />
          </div>
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

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-neutral-50/50 p-6">
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className={m.role === "assistant" ? "flex items-end gap-2" : "flex justify-end"}>
              {m.role === "assistant" && (
                <Image
                  src="/haven-home-tech-logo.png"
                  alt=""
                  width={26}
                  height={26}
                  className="mb-1 flex-none rounded-full"
                />
              )}
              <div
                className={
                  m.role === "assistant"
                    ? "max-w-[75%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white px-5 py-3 text-[15px] leading-relaxed text-neutral-700 shadow-sm ring-1 ring-neutral-200"
                    : "max-w-[75%] whitespace-pre-line rounded-2xl rounded-tr-sm px-5 py-3 text-[15px] leading-relaxed text-white shadow-sm"
                }
                style={m.role === "user" ? { backgroundColor: "#146EF5" } : undefined}
              >
                {m.image && (
                  // Customer-uploaded data URL, not a Shopify CDN image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt="Attached photo"
                    className="mb-2 max-h-48 w-full rounded-lg object-cover"
                  />
                )}
                {m.role === "assistant" ? renderWithBold(m.content) : m.content}
              </div>
            </div>
            {m.products && m.products.length > 0 && <ProductCarousel products={m.products} />}
          </div>
        ))}

        {sending && (
          <div className="flex items-end gap-2">
            <Image
              src="/haven-home-tech-logo.png"
              alt=""
              width={26}
              height={26}
              className="mb-1 flex-none rounded-full"
            />
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white px-5 py-3 text-[15px] text-neutral-400 shadow-sm ring-1 ring-neutral-200">
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
                  <span>
                    {call.label}
                    {call.detail ? ` — ${call.detail}` : " — completed"}
                  </span>
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
        className="border-t border-neutral-200 bg-white p-4"
      >
        {pendingImage && (
          <div className="mb-2 flex items-center gap-2 px-2">
            <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg border border-neutral-200">
              {/* Local blob/data URL preview, not a Shopify CDN image -- next/image's
                  remote-pattern allowlist doesn't apply, so a plain img tag here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage} alt="Attached photo" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setPendingImageBoth(null)}
              className="text-xs font-medium text-neutral-400 transition hover:text-neutral-700"
            >
              Remove photo
            </button>
          </div>
        )}
        <div className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-50 px-5 py-3 transition focus-within:border-neutral-300 focus-within:bg-white">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleImageSelect(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="Attach a photo"
            title="Attach a photo"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-neutral-500 transition hover:text-neutral-900"
          >
            <PaperclipIcon />
          </button>
          {micSupported && !voiceModeOn && (
            <button
              type="button"
              onClick={enterVoiceMode}
              disabled={sending}
              aria-label="Switch to voice mode"
              title="Switch to voice mode"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-neutral-500 transition hover:text-neutral-900"
            >
              <WaveformIcon />
            </button>
          )}
          {micSupported && voiceModeOn && (
            <div className="flex flex-none items-center gap-1.5">
              <div
                title={speaking ? "Speaking…" : listening ? "Listening…" : "In voice mode"}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-white transition ${
                  speaking ? "" : listening ? "bg-red-500" : "bg-neutral-200 text-neutral-600"
                }`}
                style={speaking ? { backgroundColor: "#146EF5" } : undefined}
              >
                {speaking || listening ? (
                  <MiniBars colorClassName="bg-white" />
                ) : (
                  <MicIcon />
                )}
              </div>
              <button
                type="button"
                onClick={exitVoiceMode}
                aria-label="Exit voice mode"
                title="Exit voice mode"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300 hover:text-neutral-900"
              >
                <XIcon />
              </button>
            </div>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={
              speaking
                ? "Speaking…"
                : listening
                  ? "Listening…"
                  : voiceModeOn
                    ? "In voice mode — type or wait to speak…"
                    : "Ask about a device, or describe a problem…"
            }
            className="flex-1 bg-transparent text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && !pendingImage)}
            className="rounded-full px-5 py-2 text-sm font-medium text-white transition disabled:bg-neutral-200 disabled:text-neutral-400"
            style={!sending && (input.trim() || pendingImage) ? { backgroundColor: "#146EF5" } : undefined}
          >
            Send
          </button>
          <button
            type="button"
            onClick={clearConversation}
            disabled={sending}
            aria-label="Clear conversation"
            title="Clear conversation"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40"
          >
            <TrashIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
