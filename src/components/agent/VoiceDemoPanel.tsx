"use client";

import { useState } from "react";
import type { Agent } from "@/lib/agents";
import { OutboundCallWidget } from "@/components/agent/OutboundCallWidget";

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
  void agent;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm font-semibold text-neutral-950">
        Have it call you
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        Drop your number below — a one-time code confirms it&apos;s really
        yours, then the real agent calls you.
      </p>
      <OutboundCallWidget />

      <div className="mt-6 border-t border-neutral-200 pt-6">
        <p className="text-sm font-semibold text-neutral-950">
          Or call it yourself
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          This runs on a real Twilio number — call it from your own phone.
        </p>
        <div className="mt-4">
          <CopyNumber />
        </div>
      </div>
    </div>
  );
}
