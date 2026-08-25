import { useMemo, useState } from "react";
import { useGame } from "@/lib/game/store";

function shufflePath(): number[] {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  return cells.slice(0, 5);
}

export function NodeSwarm() {
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const path = useMemo(() => shufflePath(), []);
  const [step, setStep] = useState(0);
  const [fails, setFails] = useState(0);

  const tap = (i: number) => {
    if (i !== path[step]) {
      setFails((f) => f + 1);
      setStep(0);
      return;
    }
    const next = step + 1;
    if (next >= path.length) {
      applyNode("swarm", { selfRef: 0.85, entropy: 0.28 });
      pushLog("SWARM path locked.");
    } else setStep(next);
  };

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">
        light cells in order · misses {fails}
      </p>
      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => {
          const idx = path.indexOf(i);
          const lit = idx !== -1 && idx < step;
          const next = path[step] === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              className={`min-h-16 rounded-sm border text-sm font-semibold tabular-nums ${
                lit
                  ? "border-primary bg-primary text-bg"
                  : next
                    ? "border-crimson bg-surface text-crimson"
                    : "border-border bg-surface text-muted"
              }`}
            >
              {idx === -1 ? "·" : idx + 1}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setScreen("factory")}
        className="mt-auto min-h-11 text-xs uppercase tracking-widest text-muted"
      >
        abort → café
      </button>
    </div>
  );
}
