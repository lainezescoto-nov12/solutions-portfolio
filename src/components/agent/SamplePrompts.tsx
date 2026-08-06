import type { SamplePrompt } from "@/lib/agents";

export function SamplePrompts({ prompts }: { prompts: SamplePrompt[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <p className="text-sm font-semibold text-neutral-950">
        You can ask the following questions
      </p>
      <ul className="mt-4 space-y-4">
        {prompts.map((p) => (
          <li key={p.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              {p.label}
            </p>
            <p className="mt-1 text-sm text-neutral-700">{p.prompt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
