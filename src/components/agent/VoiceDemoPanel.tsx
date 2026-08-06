"use client";

import { useState } from "react";
import type { Agent } from "@/lib/agents";
import { PhoneCallModal } from "@/components/agent/PhoneCallModal";
import { InboundCallModal } from "@/components/agent/InboundCallModal";

const PHONE_DISPLAY = "(984) 388-9822";
const PHONE_RAW = "+19843889822";

function CopyNumber() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(PHONE_RAW);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
    >
      {copied ? "Copied!" : `${PHONE_DISPLAY} — copy number`}
    </button>
  );
}

export function VoiceDemoPanel({ agent }: { agent: Agent }) {
  const [outboundOpen, setOutboundOpen] = useState(false);
  const [inboundOpen, setInboundOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm font-semibold text-neutral-950">
        Call and speak to Ridgeline&apos;s AI Agent
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        Talk to the real agent right in your browser over WebRTC — no
        phone number, no app, just your microphone.
      </p>
      <button
        onClick={() => setInboundOpen(true)}
        className="mt-4 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        style={{ backgroundColor: "#146EF5" }}
      >
        Run the demo
      </button>
      <p className="mt-4 text-xs text-neutral-500">
        Prefer an actual phone call instead? This same agent also runs
        on a real Twilio number:
      </p>
      <div className="mt-2">
        <CopyNumber />
      </div>

      {inboundOpen && (
        <InboundCallModal
          onClose={() => setInboundOpen(false)}
          prompts={agent.samplePrompts}
        />
      )}

      <div className="mt-6 border-t border-neutral-200 pt-6">
        <p className="text-sm font-semibold text-neutral-950">
          Have it call you
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Drop your number in, confirm the one-time code, and the real agent
          calls you live.
        </p>
        <button
          onClick={() => setOutboundOpen(true)}
          className="mt-4 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ backgroundColor: "#146EF5" }}
        >
          Run the demo
        </button>

        {outboundOpen && <PhoneCallModal onClose={() => setOutboundOpen(false)} />}
      </div>
    </div>
  );
}
