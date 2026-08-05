"use client";

import { useState } from "react";

// Placeholder for the persistent bottom-right assistant.
// TODO: wire this to the Chat agent (IoT use case) once its MCP backend
// is live — this widget answering visitor questions on the portfolio
// site itself is the intended meta-demo, not a generic chatbot.
export function AssistantWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-neutral-950">
            Ask about this portfolio
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            This assistant isn&apos;t wired up yet — it will run on the same
            Chat agent showcased on this site.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-white shadow-lg transition hover:bg-neutral-800"
        aria-label="Open assistant"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
