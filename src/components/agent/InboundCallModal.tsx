"use client";

import { useState } from "react";
import { Waveform } from "@/components/agent/Waveform";

const PHONE_DISPLAY = "(984) 388-9822";
const PHONE_RAW = "+19843889822";

// Inbound demo screen: the visitor is calling Ridgeline's real number
// themselves, so there's no identity to verify — no phone/code steps
// here, just a call-now affordance styled to match the outbound modal.
// (Verification only applies to the outbound "have it call you" flow,
// where we're the ones initiating contact with a number we don't own.)
export function InboundCallModal({ onClose }: { onClose: () => void }) {
  const [dialing, setDialing] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 px-8 py-10 text-white shadow-2xl"
      >
        <button
          onClick={onClose}
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
        <p className="text-sm text-white/50">AI Voice Agent</p>

        <p className="mt-6 text-sm font-medium text-white/70">
          {dialing ? "Dialing…" : "Tap to call the real agent"}
        </p>

        <div className="mt-2 w-full">
          <Waveform active={dialing} />
        </div>

        <a
          href={`tel:${PHONE_RAW}`}
          onClick={() => setDialing(true)}
          className="mt-6 w-full rounded-full px-5 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
          style={{ backgroundColor: "#146EF5" }}
        >
          Call {PHONE_DISPLAY}
        </a>

        <p className="mt-8 text-center text-[11px] text-white/30">
          This dials Ridgeline&apos;s real Twilio number from your phone —
          no code needed, you&apos;re the one placing the call.
        </p>
      </div>
    </div>
  );
}
