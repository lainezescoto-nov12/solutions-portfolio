import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 15%, #146EF5 0%, transparent 60%), radial-gradient(55% 55% at 85% 25%, #1d4ed8 0%, transparent 60%), radial-gradient(70% 70% at 50% 100%, #0a2472 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
          Solutions Portfolio
        </p>
        <p className="mb-3 text-lg font-semibold text-white/80">
          Jose Luis Lainez
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Three AI agents. Three different stories.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
          Click into a voice, chat, or email agent and run it yourself. Real
          tool-calling, real backends, workflows you can follow end to end.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#agents"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ backgroundColor: "#146EF5" }}
          >
            Try an agent
          </a>
          <a
            href="#about"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
          >
            How this was built
          </a>
          <Link
            href="/experience"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
          >
            Resume
          </Link>
        </div>
      </div>
    </section>
  );
}
