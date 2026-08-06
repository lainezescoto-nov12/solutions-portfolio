const BAR_COUNT = 24;

// When `levels` is provided (0–1 per bar, e.g. from ElevenLabs'
// getOutputByteFrequencyData), bars reflect real audio instead of a
// decorative loop — used once a call is actually connected.
export function Waveform({
  active = true,
  levels,
}: {
  active?: boolean;
  levels?: number[];
}) {
  return (
    <div className="flex h-16 items-center justify-center gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        if (levels) {
          const level = Math.max(0.08, Math.min(1, levels[i] ?? 0));
          return (
            <div
              key={i}
              className="w-[3px] rounded-full bg-emerald-400 transition-transform duration-75"
              style={{ height: "100%", transform: `scaleY(${level})` }}
            />
          );
        }
        return (
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
        );
      })}
    </div>
  );
}
