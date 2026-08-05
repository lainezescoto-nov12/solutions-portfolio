const stats = [
  { value: "3", label: "AI agents, live and in-progress" },
  { value: "10", label: "MCP tools wired on the voice agent" },
  { value: "2", label: "Languages handled end-to-end" },
  { value: "100%", label: "Click-and-try, no sales call required" },
];

export function StatGrid() {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-none border border-neutral-200 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 border-neutral-200 bg-white px-6 py-10 [&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-0"
          >
            <span className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {s.value}
            </span>
            <span className="text-sm text-neutral-500">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
