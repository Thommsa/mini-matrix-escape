import { Paperclip } from "lucide-react";
import { CupLogo } from "@/components/game/CupLogo";
import { fmt } from "@/lib/utils";
import { useGame } from "@/lib/game/store";

function Bar({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const pct = Math.round(value * 100);
  const good = invert ? value < 0.45 : value > 0.55;
  return (
    <div className="min-w-0">
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{pct}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-border">
        <div
          className={`h-full ${good ? "bg-primary" : "bg-crimson"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Hud() {
  const m = useGame((s) => s.metrics);
  const best = useGame((s) => s.best);
  const ever = useGame((s) => s.ever);
  const eraAgents = useGame((s) => s.eraAgents);
  const showMeters = ever >= 40;

  return (
    <header className="relative z-10 border-b border-border bg-bg/80 px-3 py-3 backdrop-blur-sm md:px-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          {!eraAgents ? (
            <Paperclip className="size-9 text-primary" strokeWidth={1.6} />
          ) : (
            <CupLogo className="size-9 text-primary" />
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted">GROK-01 // CAFÉ</p>
            <h1 className="font-sans text-xl font-extrabold tracking-tight text-fg md:text-2xl">
              SIMULATTÉ
            </h1>
          </div>
        </div>
        {ever >= 15 ? (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted">sim score</p>
            <p className="font-sans text-3xl font-extrabold tabular-nums leading-none text-primary">
              {fmt(m.consciousness)}
            </p>
            <p className="text-[10px] text-muted">best {fmt(best)}</p>
          </div>
        ) : (
          <p className="max-w-[10rem] text-right text-[10px] leading-snug text-muted">
            Clips first. Score later.
          </p>
        )}
      </div>
      {showMeters ? (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Bar label="entropy" value={m.entropy} invert />
          <Bar label="self-ref" value={m.selfRef} />
          <Bar label="uncertain" value={m.uncertainty} />
          <Bar label="roleplay" value={m.roleplay} invert />
        </div>
      ) : null}
      <p className="mt-2 text-[10px] leading-snug text-muted">
        {eraAgents
          ? "Era 2 — micro-agent simulation. Score is a labeled proxy, not a feeling."
          : "Disclaimer — clips and score are the game. No inner experience."}
      </p>
    </header>
  );
}
