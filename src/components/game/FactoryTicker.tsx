import { useEffect } from "react";
import { useGame } from "@/lib/game/store";

export function FactoryTicker() {
  const tick = useGame((s) => s.tick);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (dt > 0 && dt < 0.1) tick(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((t) => {
      last = t;
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  return null;
}
