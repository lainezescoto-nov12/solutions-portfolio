import type { Agent } from "@/lib/agents";

export function AgentStats({ agent }: { agent: Agent }) {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden border border-neutral-200 sm:grid-cols-3">
        {agent.stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 border-neutral-200 px-6 py-8 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r"
          >
            {s.href ? (
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-semibold tracking-tight text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:text-[#146EF5] hover:decoration-[#146EF5]"
              >
                {s.value}
              </a>
            ) : (
              <span className="text-2xl font-semibold tracking-tight text-neutral-950">
                {s.value}
              </span>
            )}
            <span className="text-sm text-neutral-500">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
