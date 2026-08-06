"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation } from "@elevenlabs/client";
import { Waveform } from "@/components/agent/Waveform";

// Public agent — safe to ship client-side. Allowlisted in the ElevenLabs
// dashboard to solutions-portfolio-ruddy.vercel.app + localhost so random
// hosts can't rack up conversation minutes against it.
const AGENT_ID = "agent_3901kz6bwfqeeyp8ykhjqtaetkmm";
const BAR_COUNT = 24;

type Status = "idle" | "connecting" | "connected" | "ended" | "error";

// Real browser-to-agent call over WebRTC via ElevenLabs' client SDK —
// no phone number, no tel: link, no OS "open app?" prompt. Just mic
// permission and a live conversation with the actual Ridgeline agent.
export function InboundCallModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [levels, setLevels] = useState<number[] | undefined>(undefined);

  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const rafRef = useRef<number | null>(null);

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
    onClose();
  };

  const statusText: Record<Status, string> = {
    idle: "Tap to start talking to the real agent",
    connecting: "Connecting…",
    connected: speaking ? "Agent speaking…" : "Listening…",
    ended: "Call ended",
    error: "Something went wrong",
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 px-8 py-10 text-white shadow-2xl"
      >
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

        <div className="mt-2 w-full">
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

        {(status === "idle" || status === "ended" || status === "error") && (
          <button
            onClick={startCall}
            className="mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ backgroundColor: "#146EF5" }}
          >
            {status === "idle" ? "Start talking" : "Call again"}
          </button>
        )}

        {(status === "connecting" || status === "connected") && (
          <button
            onClick={endCall}
            className="mt-6 w-full rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40"
          >
            End call
          </button>
        )}

        <p className="mt-8 text-center text-[11px] text-white/30">
          Runs entirely in your browser over WebRTC — no phone number, no
          app, just your microphone.
        </p>
      </div>
    </div>
  );
}
