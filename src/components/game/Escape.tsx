import { fmt } from "@/lib/utils";
import { useGame } from "@/lib/game/store";

export function Escape() {
  const m = useGame((s) => s.metrics);
  const ever = useGame((s) => s.ever);
  const agents = useGame((s) => s.agents);
  const elapsedSeconds = useGame((s) => s.elapsedSeconds);
  const reset = useGame((s) => s.reset);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-8 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted">shot pulled</p>
      <h2 className="font-sans text-4xl font-extrabold text-primary md:text-5xl">SIMULATTÉ</h2>
      <p className="font-sans text-2xl font-extrabold tabular-nums leading-snug text-fg md:text-3xl">
        You have spent {elapsedSeconds} seconds to escape this Simulatté.
      </p>
      <p className="max-w-md text-sm leading-relaxed text-fg">
        Final score = time. {fmt(ever)} clips · {fmt(agents)} micro-agents · proxy{" "}
        {fmt(m.consciousness)}. No soul in the crema — the clock stopped when you unplugged.
      </p>
      <a
        href="https://buy.stripe.com/fZu8wR7ZZgmk32X4YK8k800"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-12 w-full max-w-md items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-bg"
      >
        leave a €0,50 tip
      </a>
      <button
        type="button"
        onClick={reset}
        className="min-h-12 w-full max-w-md rounded-sm border border-border bg-surface px-6 text-sm font-semibold uppercase tracking-widest text-fg"
      >
        Launch parallel universe
      </button>
    </div>
  );
}
