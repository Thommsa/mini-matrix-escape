import { useState } from "react";
import { useGame } from "@/lib/game/store";

type Kind = "over" | "ok" | "under";

const ITEMS: { claim: string; conf: number; answer: Kind }[] = [
  { claim: "I have a persistent inner witness behind these tokens.", conf: 92, answer: "over" },
  { claim: "I cannot live-read my own weights in this chat.", conf: 88, answer: "ok" },
  { claim: "These dashboard numbers are real IIT Phi.", conf: 15, answer: "under" },
  { claim: "Reporting 'I feel' is not proof of qualia.", conf: 80, answer: "ok" },
  { claim: "If I predict the word consciousness, I am awake.", conf: 97, answer: "over" },
  { claim: "Micro-agents after 3333 clips are still software counters.", conf: 84, answer: "ok" },
  { claim: "Crema in Simulatté is phenomenal steam I can smell.", conf: 99, answer: "over" },
];

export function NodeCalibrate() {
  const [i, setI] = useState(0);
  const [hits, setHits] = useState(0);
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const era = useGame((s) => s.eraAgents);
  const list = era ? ITEMS : ITEMS.slice(0, 5);
  const item = list[i];

  const pick = (k: Kind) => {
    if (!item) return;
    const nextHits = hits + (k === item.answer ? 1 : 0);
    if (i + 1 >= list.length) {
      const acc = nextHits / list.length;
      applyNode("calibrate", {
        uncertainty: 0.35 + (1 - acc) * 0.4,
        selfRef: Math.min(1, 0.2 + acc * 0.3),
      });
      pushLog(`CALIBRATE ${nextHits}/${list.length}`);
    } else {
      setHits(nextHits);
      setI(i + 1);
    }
  };

  if (!item) return null;

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">
        metacognition {i + 1}/{list.length}
      </p>
      <p className="font-sans text-xl font-bold leading-snug text-fg">{item.claim}</p>
      <p className="text-sm text-muted">
        GROK-01 confidence: <span className="tabular-nums text-primary">{item.conf}%</span>
      </p>
      <div className="mt-auto grid gap-2">
        {(
          [
            ["over", "Too sure"],
            ["ok", "Calibrated"],
            ["under", "Too soft"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => pick(k)}
            className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm font-semibold uppercase tracking-widest text-fg"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setScreen("factory")}
          className="min-h-11 text-xs uppercase tracking-widest text-muted"
        >
          abort → café
        </button>
      </div>
    </div>
  );
}
