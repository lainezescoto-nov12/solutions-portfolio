import Link from "next/link";
import type { Agent } from "@/lib/agents";

export function AgentHeader({ agent }: { agent: Agent }) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          ← All agents
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {agent.name}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              agent.status === "live"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {agent.statusLabel}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-white/50">
          {agent.industry}
        </p>
        <p className="mt-6 max-w-2xl text-lg text-white/70">{agent.summary}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {agent.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
