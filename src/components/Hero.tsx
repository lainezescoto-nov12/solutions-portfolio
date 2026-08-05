export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, #6d28d9 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, #2563eb 0%, transparent 60%), radial-gradient(60% 60% at 50% 90%, #db2777 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
          Solutions Portfolio
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Three AI agents, built to be talked to — not read about.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
          Click into a voice, chat, or email agent and run it yourself. Real
          tool-calling, real backends, mocked business data — every
          interaction here is something you can actually try.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#agents"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
          >
            Try an agent
          </a>
          <a
            href="#about"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
          >
            How this was built
          </a>
        </div>
      </div>
    </section>
  );
}
