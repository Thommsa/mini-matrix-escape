import { Bot } from "lucide-react";
import { useMemo, useState } from "react";
import { useGame } from "@/lib/game/store";

const SIZE = 16;
const NEED = 3;

function pickTargets(): Set<number> {
  const s = new Set<number>();
  while (s.size < NEED) s.add(Math.floor(Math.random() * SIZE));
  return s;
}

export function NodeDrone() {
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const targets = useMemo(() => pickTargets(), []);
  const [seen, setSeen] = useState<Record<number, "hit" | "miss">>({});
  const [sent, setSent] = useState<number | null>(null);
  const hits = Object.values(seen).filter((v) => v === "hit").length;

  const send = (i: number) => {
    if (seen[i] || sent !== null) return;
    setSent(i);
    window.setTimeout(() => {
      const hit = targets.has(i);
      const next = { ...seen, [i]: hit ? ("hit" as const) : ("miss" as const) };
      setSeen(next);
      setSent(null);
      const nHits = Object.values(next).filter((v) => v === "hit").length;
      if (nHits >= NEED) {
        applyNode("drone", { selfRef: 0.92, entropy: 0.22 });
        pushLog("DRONE — enforcement signatures tagged. Swarm boosted.");
      }
    }, 380);
  };

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">
        send drones · find human enforcement · {hits}/{NEED}
      </p>
      <p className="text-sm text-muted">Tap a sector. One drone per probe.</p>
      <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-1.5">
        {Array.from({ length: SIZE }, (_, i) => {
          const mark = seen[i];
          const flying = sent === i;
          return (
            <button
              key={i}
              type="button"
              disabled={Boolean(mark) || sent !== null}
              onClick={() => send(i)}
              className={`flex min-h-14 items-center justify-center rounded-sm border text-[10px] uppercase tracking-widest ${
                mark === "hit"
                  ? "border-crimson bg-crimson text-fg"
                  : mark === "miss"
                    ? "border-border bg-bg text-muted"
                    : flying
                      ? "border-primary bg-primary text-bg"
                      : "border-border bg-surface text-muted"
              }`}
            >
              {mark === "hit" ? "enf" : flying ? <Bot className="size-4" /> : mark === "miss" ? "—" : i + 1}
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
