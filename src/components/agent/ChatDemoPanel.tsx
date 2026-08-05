// Chat UI shell for the IoT product-rec / troubleshooting agent.
// TODO: wire this up to the real MCP tool-calling backend + Firestore
// mock catalog. For now it renders the UI with a disabled input so the
// layout and interaction model are locked in before the backend lands.
export function ChatDemoPanel() {
  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-neutral-200 bg-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          Hi, I&apos;m the IoT support assistant. Ask me to recommend a
          device, or describe a problem you&apos;re running into.
        </div>
      </div>
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <input
            disabled
            placeholder="Backend not wired up yet — try a sample prompt below"
            className="flex-1 bg-transparent text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
          />
          <button
            disabled
            className="rounded-full bg-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
