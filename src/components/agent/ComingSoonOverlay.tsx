import type { ReactNode } from "react";

// Wraps an in-progress agent's demo panel so visitors can see the shape
// of it but can't interact with or click past it yet. Applies a blur +
// disabled overlay rather than hiding the panel outright, since the
// layout itself is part of showing the work.
export function ComingSoonOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/40 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white">
          🔒
        </span>
        <p className="text-sm font-semibold text-neutral-950">
          Coming soon
        </p>
        <p className="max-w-[220px] text-xs text-neutral-500">
          This agent&apos;s backend is still being built — check back soon
          to try it live.
        </p>
      </div>
    </div>
  );
}
