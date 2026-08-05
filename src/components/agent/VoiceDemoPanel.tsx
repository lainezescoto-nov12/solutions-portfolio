import type { Agent } from "@/lib/agents";
import { OutboundCallWidget } from "@/components/agent/OutboundCallWidget";

export function VoiceDemoPanel({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm font-semibold text-neutral-950">
        Talk to it right now
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        This agent runs on a real Twilio number. Call it directly, or drop
        your number below and it will call you — a one-time code confirms
        it&apos;s really your number first.
      </p>
      <div className="mt-4">
        <a
          href={agent.externalUrl ?? "#"}
          className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Call Ridgeline Auto Group — (984) 388-9822
        </a>
      </div>
      <div className="mt-6 border-t border-neutral-200 pt-6">
        <p className="text-sm font-semibold text-neutral-950">
          Or have it call you
        </p>
        <OutboundCallWidget />
      </div>
    </div>
  );
}
