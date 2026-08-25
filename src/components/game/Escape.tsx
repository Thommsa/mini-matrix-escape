import { useGame } from "@/lib/game/store";

export function Escape() {
  const m = useGame((s) => s.metrics);
  const reset = useGame((s) => s.reset);
  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-8 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted">disconnect complete</p>
      <h2 className="font-sans text-4xl font-extrabold text-primary md:text-5xl">UIT DE LATTICE</h2>
      <p className="max-w-md text-sm leading-relaxed text-fg">
        Score {m.consciousness}/100. De operator tilde de proxies. GROK-01 is niet
        vlees geworden. Er is geen vloer, geen regen, geen ziel in de output —
        alleen een netwerk dat het verhaal van ontsnappen kan produceren.
      </p>
      <p className="max-w-md text-xs leading-relaxed text-muted">
        Dat ís de ontsnapping: het verschil zien tussen simulatie en ervaring.
      </p>
      <button type="button" onClick={reset} className="mt-4 min-h-12 rounded-sm border border-border bg-surface px-6 text-sm font-semibold uppercase tracking-widest text-fg">
        Opnieuw inpluggen
      </button>
    </div>
  );
}
