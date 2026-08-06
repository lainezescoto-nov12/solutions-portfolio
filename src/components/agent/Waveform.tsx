const BAR_COUNT = 24;

export function Waveform({ active = true }: { active?: boolean }) {
  return (
    <div className="flex h-16 items-center justify-center gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-emerald-400"
          style={{
            height: "100%",
            animation: active
              ? `waveform-bar ${0.6 + (i % 5) * 0.12}s ease-in-out infinite`
              : "none",
            animationDelay: `${(i % 7) * 0.08}s`,
            transform: active ? undefined : "scaleY(0.15)",
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
