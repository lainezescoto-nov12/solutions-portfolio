"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation } from "@elevenlabs/client";
import { Waveform } from "@/components/agent/Waveform";
import { SamplePrompts } from "@/components/agent/SamplePrompts";
import type { SamplePrompt } from "@/lib/agents";

// Public agent — safe to ship client-side. Allowlisted in the ElevenLabs
// dashboard to solutions-portfolio-ruddy.vercel.app so random hosts can't
// rack up conversation minutes against it.
const AGENT_ID = "agent_3901kz6bwfqeeyp8ykhjqtaetkmm";
const BAR_COUNT = 24;

type Status = "idle" | "connecting" | "connected" | "ended" | "error";

type ToolActivity = {
  id: string;
  label: string;
  doneLabel: string;
  errorLabel: string;
  state: "running" | "done" | "error";
};

// Friendly copy for each real tool the agent can call, keyed by the exact
// tool name registered on the MCP server — shown live in the "Behind the
// scenes" panel so a visitor can see the agent is actually hitting real
// systems (Calendar, Firestore, n8n), not just generating plausible text.
const TOOL_COPY: Record<string, { label: string; doneLabel: string }> = {
  check_availability: { label: "Checking appointment availability…", doneLabel: "Open times found" },
  book_appointment: { label: "Booking your appointment…", doneLabel: "Appointment booked" },
  reschedule_appointment: { label: "Rescheduling your appointment…", doneLabel: "Appointment rescheduled" },
  cancel_appointment: { label: "Cancelling your appointment…", doneLabel: "Appointment cancelled" },
  find_appointment: { label: "Looking up your appointment…", doneLabel: "Appointment located" },
  intake_trade_in: { label: "Calculating your trade-in value…", doneLabel: "Trade-in estimate ready" },
  check_vehicle_status: { label: "Checking vehicle status…", doneLabel: "Vehicle status retrieved" },
  dealership_faq_lookup: { label: "Checking our knowledge base…", doneLabel: "Answer found" },
  check_part_availability: { label: "Checking parts inventory…", doneLabel: "Parts availability checked" },
  trigger_outbound_reminder: { label: "Placing outbound call…", doneLabel: "Call placed" },
};

function toolCopyFor(toolName: string) {
  return (
    TOOL_COPY[toolName] ?? {
      label: `Calling ${toolName}…`,
      doneLabel: `${toolName} completed`,
    }
  );
}

// Real browser-to-agent call over WebRTC via ElevenLabs' client SDK —
// no phone number, no tel: link, no OS "open app?" prompt. Just mic
// permission and a live conversation with the actual Ridgeline agent.
//
// Laid out as a bottom sheet split into two panels (call UI left, sample
// prompts right) instead of a full-screen blurred overlay — the previous
// version blurred the exact prompts a visitor would want to read while
// mid-call.
export function InboundCallModal({
  onClose,
  prompts,
}: {
  onClose: () => void;
  prompts: SamplePrompt[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [levels, setLevels] = useState<number[] | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [toolActivity, setToolActivity] = useState<ToolActivity[]>([]);

  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Mount on the next frame so the initial render is off-screen, then
    // the transition to translate-y-0 is what actually animates the
    // slide-up rather than snapping in place.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    // Lock page scroll while this is open -- otherwise the page behind
    // a full-screen takeover keeps scrolling, which is disorienting.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const stopVisualizer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLevels(undefined);
  }, []);

  const startVisualizer = useCallback(() => {
    const tick = () => {
      const conv = conversationRef.current;
      if (!conv) return;
      try {
        const freq = conv.getOutputByteFrequencyData();
        const step = Math.floor(freq.length / BAR_COUNT) || 1;
        const next: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          next.push((freq[i * step] ?? 0) / 255);
        }
        setLevels(next);
      } catch {
        // conversation not ready for frequency data yet — skip this frame
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const endCall = useCallback(async () => {
    stopVisualizer();
    try {
      await conversationRef.current?.endSession();
    } catch {
      // session may already be closed — nothing to do
    }
    conversationRef.current = null;
    setStatus((s) => (s === "error" ? s : "ended"));
  }, [stopVisualizer]);

  useEffect(() => {
    return () => {
      stopVisualizer();
      conversationRef.current?.endSession().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCall = async () => {
    setStatus("connecting");
    setErrorMessage("");
    setToolActivity([]);
    try {
      // Ask for the mic explicitly so a denial surfaces as a clear error
      // instead of failing inside the SDK's connection handshake.
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        onConnect: () => {
          setStatus("connected");
          startVisualizer();
        },
        onDisconnect: () => {
          stopVisualizer();
          setStatus("ended");
        },
        onError: (message: unknown) => {
          stopVisualizer();
          setErrorMessage(
            typeof message === "string" ? message : "Something went wrong on the call."
          );
          setStatus("error");
        },
        onModeChange: (m: { mode: string }) => {
          setSpeaking(m?.mode === "speaking");
        },
        onAgentToolRequest: (props: { tool_name: string; tool_call_id: string }) => {
          const copy = toolCopyFor(props.tool_name);
          setToolActivity((prev) => [
            ...prev,
            {
              id: props.tool_call_id,
              label: copy.label,
              doneLabel: copy.doneLabel,
              errorLabel: "Something went wrong with that lookup",
              state: "running",
            },
          ]);
        },
        onAgentToolResponse: (props: { tool_call_id: string; is_error: boolean }) => {
          setToolActivity((prev) =>
            prev.map((entry) =>
              entry.id === props.tool_call_id
                ? { ...entry, state: props.is_error ? "error" : "done" }
                : entry
            )
          );
        },
      });
      conversationRef.current = conversation;
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Couldn't access your microphone — check your browser permissions."
      );
    }
  };

  const handleClose = () => {
    endCall();
    setMounted(false);
    setTimeout(onClose, 200);
  };

  const statusText: Record<Status, string> = {
    idle: "Tap to start talking to the real agent",
    connecting: "Connecting…",
    connected: speaking ? "Agent speaking…" : "Listening…",
    ended: "Call ended",
    error: "Something went wrong",
  };

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden">
      <div
        className={`flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out sm:flex-row ${
          mounted ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Left: the call UI */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 px-8 py-10 text-white sm:w-1/2 sm:flex-none">
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-white/40 hover:text-white"
          >
            ×
          </button>

          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold"
            style={{ background: "linear-gradient(135deg, #146EF5 0%, #0a2472 100%)" }}
          >
            RA
          </div>
          <p className="mt-4 text-lg font-semibold">Ridgeline Auto Group</p>
          <p className="text-sm text-white/50">AI Voice Agent — live in your browser</p>

          <p className="mt-6 text-sm font-medium text-white/70">
            {statusText[status]}
          </p>

          <div className="mt-2 w-full max-w-xs">
            <Waveform
              active={status === "connecting" || status === "connected"}
              levels={status === "connected" ? levels : undefined}
            />
          </div>

          {status === "error" && (
            <p className="mt-2 max-w-[260px] text-center text-xs text-red-400">
              {errorMessage}
            </p>
          )}

          {toolActivity.length > 0 && (
            <div className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Behind the scenes
              </p>
              <ul className="flex flex-col gap-1.5">
                {toolActivity.slice(-5).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 text-xs text-white/70 animate-[fadeIn_0.25s_ease-out]"
                  >
                    <span className="flex h-3.5 w-3.5 flex-none items-center justify-center">
                      {entry.state === "running" && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                      )}
                      {entry.state === "done" && (
                        <span className="text-emerald-400">✓</span>
                      )}
                      {entry.state === "error" && (
                        <span className="text-red-400">!</span>
                      )}
                    </span>
                    <span>
                      {entry.state === "running"
                        ? entry.label
                        : entry.state === "done"
                          ? entry.doneLabel
                          : entry.errorLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(status === "idle" || status === "ended" || status === "error") && (
            <button
              onClick={startCall}
              className="mt-6 w-full max-w-xs rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ backgroundColor: "#146EF5" }}
            >
              {status === "idle" ? "Start talking" : "Call again"}
            </button>
          )}

          {(status === "connecting" || status === "connected") && (
            <button
              onClick={endCall}
              className="mt-6 w-full max-w-xs rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              End call
            </button>
          )}

          <p className="mt-8 max-w-xs text-center text-[11px] text-white/30">
            Every tool call you see is real — live inventory, live calendar,
            live email. Your browser will ask for microphone permission.
          </p>
        </div>

        {/* Right: the same sample prompts as the page, kept fully
            legible and scrollable independently of the call panel. */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 p-6 sm:w-1/2 sm:flex-none sm:p-8">
          <SamplePrompts prompts={prompts} />
        </div>
      </div>
    </div>
  );
}
