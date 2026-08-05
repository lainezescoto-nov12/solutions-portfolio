export function DarkSection() {
  return (
    <section id="about" className="border-y border-neutral-900 bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
          How this was built
        </p>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Every agent here runs on real infrastructure, not a scripted demo.
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Real tool-calling</h3>
            <p className="mt-2 text-sm text-white/60">
              Each agent calls actual MCP tools against a backend — Firestore
              for data, Google Calendar and Gmail for the voice agent — not
              hard-coded response text.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mocked, not faked, data</h3>
            <p className="mt-2 text-sm text-white/60">
              Where there's no live business system to connect to (no
              ShipStation, no device fleet), the data is seeded and realistic,
              but the agent logic and state changes are genuine.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Built to be tested</h3>
            <p className="mt-2 text-sm text-white/60">
              Every agent page ships with sample prompts so you can run the
              exact flow end to end instead of trusting a screenshot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
