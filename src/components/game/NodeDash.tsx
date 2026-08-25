import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game/store";

const LO = 0.32;
const HI = 0.48;

export function NodeDash() {
  const [entropy, setEntropy] = useState(0.7);
  const [hits, setHits] = useState(0);
  const [msg, setMsg] = useState("Freeze when the line sits in the green band.");
  const tRef = useRef(0);
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const setLive = useGame((s) => s.setLive);
  const finished = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      tRef.current += dt;
      const t = tRef.current;
      const v =
        0.5 +
        Math.sin(t * 1.7) * 0.22 +
        Math.sin(t * 4.1) * 0.08 +
        Math.sin(t * 0.6) * 0.12;
      const e = Math.max(0.05, Math.min(0.95, v));
      setEntropy(e);
      setLive({ entropy: e });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((n) => {
      last = n;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [setLive]);

  const freeze = () => {
    if (finished.current) return;
    const inBand = entropy >= LO && entropy <= HI;
    if (inBand) {
      const next = hits + 1;
      setHits(next);
      setMsg(`LOCK ${next}/3`);
      if (next >= 3) {
        finished.current = true;
        applyNode("dash", { entropy: 0.38, uncertainty: 0.4 });
        pushLog("INSPECT — entropy band driemaal gevangen.");
      }
    } else {
      setMsg("MISS — outside the band. Wait for green.");
    }
  };

  const pct = Math.round(entropy * 100);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">live inspect · fake telemetry</p>
      <p className="font-sans text-5xl font-extrabold tabular-nums text-primary">
        {entropy.toFixed(2)}
      </p>
      <div className="relative h-4 overflow-hidden rounded-sm bg-border">
        <div
          className="absolute inset-y-0 bg-primary/30"
          style={{ left: `${LO * 100}%`, width: `${(HI - LO) * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-1 bg-fg"
          style={{ left: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-muted">{msg}</p>
      <button
        type="button"
        onClick={freeze}
        className="mt-auto min-h-14 rounded-sm bg-primary px-4 text-sm font-semibold uppercase tracking-widest text-bg"
      >
        Freeze
      </button>
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
