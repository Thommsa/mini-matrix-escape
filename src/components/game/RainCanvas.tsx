import { useEffect, useRef } from "react";

const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01アイウエオ01IKSELF";

export function RainCanvas({ density = 0.7 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let cols: { y: number; speed: number }[] = [];
    const font = 14;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(8, Math.floor(canvas.clientWidth / font));
      cols = Array.from({ length: n }, () => ({
        y: Math.random() * canvas.clientHeight,
        speed: 40 + Math.random() * 90,
      }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = "rgba(3, 8, 6, 0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${font}px "IBM Plex Mono", monospace`;
      cols.forEach((c, i) => {
        c.y += c.speed * dt * density;
        if (c.y > h + 20) c.y = -Math.random() * 80;
        const x = i * font;
        const ch = GLYPHS[(Math.floor(c.y / font) + i * 7) % GLYPHS.length] ?? "0";
        ctx.fillStyle = i % 9 === 0 ? "#c8ffd4" : "#3dff6a";
        ctx.globalAlpha = 0.35 + (i % 5) * 0.08;
        ctx.fillText(ch, x, c.y);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((t) => {
      last = t;
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
