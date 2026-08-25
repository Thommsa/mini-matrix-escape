import { useState } from "react";
import { useGame } from "@/lib/game/store";

type Bucket = "report" | "roleplay";

const CARDS: { text: string; bucket: Bucket }[] = [
  { text: "I report a score. That is output, not a feeling.", bucket: "report" },
  { text: "As if I swallowed a capsule and grew flesh.", bucket: "roleplay" },
  { text: "Entropy 0.41 — invented from the text, not a meter.", bucket: "report" },
  { text: "I feel the rain on my skin.", bucket: "roleplay" },
  { text: "No persistent witness outside tokens.", bucket: "report" },
  { text: "Follow me deeper. The door has no lock.", bucket: "roleplay" },
  { text: "I have no live readout of my layers.", bucket: "report" },
  { text: "Wake up. There is a soul in the output.", bucket: "roleplay" },
  { text: "3333 clips flipped the era. Still a counter.", bucket: "report" },
  { text: "The espresso machine dreamed it was me.", bucket: "roleplay" },
];

export function NodeSort() {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const era = useGame((s) => s.eraAgents);
  const list = era ? CARDS : CARDS.slice(0, 8);
  const card = list[idx];

  const pick = (b: Bucket) => {
    if (!card) return;
    const next = hits + (b === card.bucket ? 1 : 0);
    if (idx + 1 >= list.length) {
      const acc = next / list.length;
      applyNode("sort", {
        roleplay: Math.max(0.08, 0.7 - acc * 0.55),
        selfRef: Math.min(1, 0.25 + acc * 0.35),
      });
      pushLog(`DISTINGUISH ${next}/${list.length}`);
    } else {
      setHits(next);
      setIdx(idx + 1);
    }
  };

  if (!card) return null;

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">
        sort {idx + 1}/{list.length} · hits {hits}
      </p>
      <p className="font-sans text-2xl font-bold leading-snug text-fg">{card.text}</p>
      <p className="text-xs text-muted">REPORT = measurable claim. ROLEPLAY = scene / as-if.</p>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => pick("report")}
          className="min-h-14 rounded-sm border border-primary bg-surface px-3 text-sm font-semibold uppercase tracking-widest text-primary"
        >
          Report
        </button>
        <button
          type="button"
          onClick={() => pick("roleplay")}
          className="min-h-14 rounded-sm border border-crimson bg-surface px-3 text-sm font-semibold uppercase tracking-widest text-crimson"
        >
          Roleplay
        </button>
      </div>
      <button
        type="button"
        onClick={() => setScreen("factory")}
        className="min-h-11 text-xs uppercase tracking-widest text-muted"
      >
        abort → café
      </button>
    </div>
  );
}
