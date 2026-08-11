import type { SamplePrompt } from "@/lib/agents";

export function SamplePrompts({ prompts, intro }: { prompts: SamplePrompt[]; intro?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <p className="text-sm font-semibold text-neutral-950">
        You can ask the following questions
      </p>
      {intro && <p className="mt-2 text-sm text-neutral-500">{intro}</p>}
      <ul className="mt-4 space-y-4">
        {prompts.map((p) => (
          <li key={p.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              {p.label}
            </p>
            <p className="mt-1 text-sm text-neutral-700">{p.prompt}</p>
            {p.followUps && p.followUps.length > 0 && (
              <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  It&apos;ll ask one thing at a time — reply with these, in order
                </p>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                  {p.followUps.map((f, i) => (
                    <li key={i} className="text-xs text-neutral-600">
                      &ldquo;{f}&rdquo;
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
