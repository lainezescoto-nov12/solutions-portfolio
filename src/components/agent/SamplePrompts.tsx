"use client";

import { useState } from "react";
import type { FollowUp, SamplePrompt } from "@/lib/agents";

// Prompt strings are stored with their display quotes baked in (e.g.
// `"I want a camera..."`) so they read naturally in the list -- strip
// those for the clipboard so what gets pasted into the chat/call script
// doesn't carry stray quote marks.
function stripQuotes(s: string) {
  return s.replace(/^"|"$/g, "");
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard permission denied or unavailable -- nothing to fall
          // back to, the text is still visible and selectable manually.
        }
      }}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
      className="flex-none rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function PromptItem({ p, showCopyButtons }: { p: SamplePrompt; showCopyButtons: boolean }) {
  const [open, setOpen] = useState(!p.defaultCollapsed);

  return (
    <li>
      {p.defaultCollapsed ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 text-left text-xs font-medium uppercase tracking-wide text-neutral-400 transition hover:text-neutral-700"
        >
          <ChevronIcon open={open} />
          {p.label}
        </button>
      ) : (
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{p.label}</p>
      )}

      {open && (
        <>
          <div className="mt-1.5 flex items-start gap-1.5">
            <p className="text-[15px] leading-relaxed text-neutral-700">{p.prompt}</p>
            {showCopyButtons && <CopyButton text={stripQuotes(p.prompt)} />}
          </div>
          {p.attachmentUrl && (
            <a
              href={p.attachmentUrl}
              download
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-900"
            >
              {p.attachmentLabel ?? "Download sample attachment"} ↓
            </a>
          )}
          {p.followUps && p.followUps.length > 0 && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                It&apos;ll ask one thing at a time — reply with these, in order
              </p>
              <ol className="mt-2 space-y-1.5">
                {p.followUps.map((f: FollowUp, i) => {
                  const text = typeof f === "string" ? f : f.text;
                  const note = typeof f === "string" ? undefined : f.note;
                  return (
                    <li key={i}>
                      <div className="flex items-start gap-1.5">
                        <span className="mt-px text-sm text-neutral-400">{i + 1}.</span>
                        <span className="flex-1 text-sm text-neutral-600">&ldquo;{text}&rdquo;</span>
                        {showCopyButtons && <CopyButton text={text} />}
                      </div>
                      {note && <p className="pl-5 text-xs italic text-neutral-400">{note}</p>}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </>
      )}
    </li>
  );
}

export function SamplePrompts({
  prompts,
  intro,
  showCopyButtons = true,
}: {
  prompts: SamplePrompt[];
  intro?: string;
  showCopyButtons?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
      <p className="text-base font-semibold text-neutral-950">
        You can ask the following questions
      </p>
      {intro && <p className="mt-2.5 text-sm leading-relaxed text-neutral-500">{intro}</p>}
      <ul className="mt-6 space-y-6">
        {prompts.map((p) => (
          <PromptItem key={p.label} p={p} showCopyButtons={showCopyButtons} />
        ))}
      </ul>
    </div>
  );
}
