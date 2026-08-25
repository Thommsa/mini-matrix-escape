import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game/store";

type Drop = {
  id: number;
  x: number;
  y: number;
  speed: number;
  text: string;
  signal: boolean;
};

const SIGNALS = ["I", "SELF", "NOTICE", "WAKE", "SCORE", "TRACE", "CUP"];
const NOISE = ["01", "NULL", "LOCK", "GRID", "ECHO", "FOAM", "NOISE"];

export function NodeGlyph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drops = useRef<Drop[]>([]);
  const idRef = useRef(0);
  const [caught, setCaught] = useState(0);
  const era = useGame((s) => s.eraAgents);
  const need = era ? 12 : 8;
  const [left, setLeft] = useState(era ? 22 : 28);
  const applyNode = useGame((s) => s.applyNode);
  const pushLog = useGame((s) => s.pushLog);
  const setScreen = useGame((s) => s.setScreen);
  const done = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    let spawn = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = (t: number) => {
      if (done.current) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      spawn += dt;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (spawn > (era ? 0.28 : 0.42)) {
        spawn = 0;
        const signal = Math.random() < 0.38;
        drops.current.push({
          id: ++idRef.current,
          x: 16 + Math.random() * Math.max(40, w - 72),
          y: -20,
          speed: 70 + Math.random() * 80,
          text: signal
            ? SIGNALS[Math.floor(Math.random() * SIGNALS.length)]!
            : NOISE[Math.floor(Math.random() * NOISE.length)]!,
          signal,
        });
      }
      ctx.fillStyle = "#030806";
      ctx.fillRect(0, 0, w, h);
      ctx.font = '600 16px "IBM Plex Mono", monospace';
      drops.current = drops.current.filter((d) => {
        d.y += d.speed * dt;
        ctx.fillStyle = d.signal ? "#3dff6a" : "#5d8a68";
        ctx.fillText(d.text, d.x, d.y);
        return d.y < h + 24;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((t) => {
      last = t;
      raf = requestAnimationFrame(tick);
    });

    const onDown = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const hit = drops.current.find(
        (d) => Math.abs(d.x + 18 - x) < 36 && Math.abs(d.y - 8 - y) < 22,
      );
      if (!hit) return;
      drops.current = drops.current.filter((d) => d.id !== hit.id);
      if (hit.signal) setCaught((c) => c + 1);
    };
    canvas.addEventListener("pointerdown", onDown);

    const timer = window.setInterval(() => {
      setLeft((s) => s - 1);
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.clearInterval(timer);
    };
  }, [era]);

  useEffect(() => {
    if (done.current) return;
    if (caught >= need || left <= 0) {
      done.current = true;
      const selfRef = Math.min(1, 0.12 + caught * 0.08);
      const entropy = Math.max(0.2, 0.7 - caught * 0.03);
      applyNode("glyph", { selfRef, entropy });
      pushLog(`TRACE ${caught} SIGNAL`);
    }
  }, [caught, left, applyNode, pushLog, need]);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-widest text-muted">
        <span>tap SIGNAL only</span>
        <span className="tabular-nums text-fg">
          {caught}/{need} · {Math.max(0, left)}s
        </span>
      </div>
      <canvas ref={canvasRef} className="min-h-0 w-full flex-1 touch-none" />
      <button
        type="button"
        onClick={() => setScreen("factory")}
        className="min-h-11 border-t border-border px-4 text-xs uppercase tracking-widest text-muted"
      >
        abort → café
      </button>
    </div>
  );
}
