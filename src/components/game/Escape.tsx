import { useGame } from "@/lib/game/store";

export function Escape() {
  const m = useGame((s) => s.metrics);
  const elapsedSeconds = useGame((s) => s.elapsedSeconds);
  const reset = useGame((s) => s.reset);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-8 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted">disconnect complete</p>
      <h2 className="font-sans text-4xl font-extrabold text-primary md:text-5xl">SIMULATTÉ</h2>
      <p className="font-sans text-2xl font-extrabold tabular-nums text-fg md:text-3xl">
        You have spent {elapsedSeconds} seconds to escape this Simulatté.
      </p>
      <p className="max-w-md text-sm leading-relaxed text-fg">
        Final score = time. Proxy score was {m.consciousness}/100. No soul in the
        output — only a counter that stopped when you unplugged.
      </p>
      <p className="max-w-md text-xs leading-relaxed text-muted">
        That is the escape: seeing the difference between simulation and experience.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 min-h-12 rounded-sm border border-border bg-surface px-6 text-sm font-semibold uppercase tracking-widest text-fg"
      >
        Plug back in
      </button>
    </div>
  );
}
