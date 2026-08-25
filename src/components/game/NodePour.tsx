import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game/store";

export function NodePour() {
  const [level, setLevel] = useState(0);
  const [held, setHeld] = useState(false);
  const [locks, setLocks] = useState(0);
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const done = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      setLevel((v) => {
        const next = held ? v + dt * 0.55 : v - dt * 0.35;
        return Math.max(0, Math.min(1, next));
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((t) => {
      last = t;
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [held]);

  const release = () => {
    setHeld(false);
    if (done.current) return;
    if (level >= 0.62 && level <= 0.78) {
      const n = locks + 1;
      setLocks(n);
      if (n >= 3) {
        done.current = true;
        applyNode("pour", { uncertainty: 0.38, entropy: 0.3 });
        pushLog("POUR — crema band ×3");
      }
    }
  };

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted">hold to pour · release in the band · {locks}/3</p>
      <div className="relative mx-auto h-56 w-24 overflow-hidden rounded-sm border border-border bg-surface">
        <div
          className="absolute inset-x-0 bg-primary/25"
          style={{ bottom: "22%", height: "16%" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-primary"
          style={{ height: `${Math.round(level * 100)}%` }}
        />
      </div>
      <button
        type="button"
        onPointerDown={() => setHeld(true)}
        onPointerUp={release}
        onPointerCancel={release}
        className="mt-auto min-h-14 rounded-sm bg-primary px-4 text-sm font-semibold uppercase tracking-widest text-bg"
      >
        Hold pour
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
