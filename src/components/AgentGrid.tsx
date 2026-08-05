import Link from "next/link";
import { agents } from "@/lib/agents";

const gradients: Record<string, string> = {
  voice: "from-violet-600 to-blue-600",
  chat: "from-blue-600 to-cyan-500",
  email: "from-pink-600 to-orange-500",
};

export function AgentGrid() {
  return (
    <section id="agents" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          Pick an agent
        </h2>
        <p className="mt-4 text-lg text-neutral-600">
          Each one solves a different job. Click in to see the use case,
          sample prompts, and try it yourself.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.slug}
            href={`/agents/${agent.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-lg"
          >
            <div
              className={`h-28 w-full bg-gradient-to-br ${gradients[agent.slug]}`}
            />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-950">
                  {agent.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    agent.status === "live"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {agent.status === "live" ? "Live" : "In progress"}
                </span>
              </div>
              <p className="text-sm font-medium text-neutral-500">
                {agent.industry}
              </p>
              <p className="text-sm text-neutral-600">{agent.tagline}</p>
              <span className="mt-auto pt-2 text-sm font-semibold text-neutral-950 group-hover:underline">
                Try it →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
