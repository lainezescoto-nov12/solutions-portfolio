import type { Agent } from "@/lib/agents";

// This agent is already live outside this site — no in-page demo to build,
// just a clear hand-off to the real phone number / call widget.
export function VoiceDemoPanel({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm font-semibold text-neutral-950">
        Talk to it right now
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        This agent runs on a real Twilio number, not a browser widget. Call
        it, or use the embedded call button once it&apos;s wired up here.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={agent.externalUrl ?? "#"}
          className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Call Ridgeline Auto Group
        </a>
        <span className="self-center text-xs text-neutral-400">
          TODO: swap in real number / embedded ElevenLabs call widget
        </span>
      </div>
    </div>
  );
}
