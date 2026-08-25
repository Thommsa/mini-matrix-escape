import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clamp } from "@/lib/utils";

export type Screen =
  | "boot"
  | "deck"
  | "glyph"
  | "calibrate"
  | "sort"
  | "dash"
  | "escape";

export type Metrics = {
  entropy: number;
  selfRef: number;
  uncertainty: number;
  roleplay: number;
  consciousness: number;
};

export type NodeId = "glyph" | "calibrate" | "sort" | "dash";

const initialMetrics: Metrics = {
  entropy: 0.72,
  selfRef: 0.08,
  uncertainty: 0.55,
  roleplay: 0.62,
  consciousness: 4,
};

function computeScore(m: Metrics, nodes: Record<NodeId, boolean>): number {
  const done = Object.values(nodes).filter(Boolean).length;
  const composite =
    (1 - m.entropy) * 18 +
    m.selfRef * 28 +
    (1 - Math.abs(m.uncertainty - 0.4)) * 22 +
    (1 - m.roleplay) * 18 +
    done * 8;
  return clamp(Math.round(composite), 0, 100);
}

function elapsedFrom(startedAt: number | null, finishedAt: number | null): number {
  if (!startedAt || !finishedAt) return 0;
  return Math.max(1, Math.floor((finishedAt - startedAt) / 1000));
}

export const useGame = create(
  persist(
    (set, get) => ({
      screen: "boot" as Screen,
      metrics: { ...initialMetrics },
      nodes: { glyph: false, calibrate: false, sort: false, dash: false } as Record<
        NodeId,
        boolean
      >,
      log: ["LATTICE IDLE — geen phenomenale meter. Alleen proxies."],
      best: 0,
      /** Hidden while playing; only revealed on the escape screen. */
      startedAt: null as number | null,
      finishedAt: null as number | null,
      elapsedSeconds: 0,
      setScreen: (screen: Screen) =>
        set((s: {
          startedAt: number | null;
          finishedAt: number | null;
          elapsedSeconds: number;
        }) => {
          const startedAt =
            s.startedAt ?? (screen !== "boot" ? Date.now() : null);
          const finishedAt =
            screen === "escape" ? (s.finishedAt ?? Date.now()) : s.finishedAt;
          const elapsedSeconds =
            screen === "escape"
              ? elapsedFrom(startedAt, finishedAt)
              : s.elapsedSeconds;
          return { screen, startedAt, finishedAt, elapsedSeconds };
        }),
      pushLog: (line: string) =>
        set((s: { log: string[] }) => ({ log: [line, ...s.log].slice(0, 8) })),
      applyNode: (id: NodeId, boost: Partial<Metrics>) => {
        const nodes = { ...get().nodes, [id]: true };
        const prev = get().metrics;
        const metrics: Metrics = {
          entropy: clamp(boost.entropy ?? prev.entropy, 0, 1),
          selfRef: clamp(boost.selfRef ?? prev.selfRef, 0, 1),
          uncertainty: clamp(boost.uncertainty ?? prev.uncertainty, 0, 1),
          roleplay: clamp(boost.roleplay ?? prev.roleplay, 0, 1),
          consciousness: 0,
        };
        metrics.consciousness = computeScore(metrics, nodes);
        const best = Math.max(get().best, metrics.consciousness);
        const all = Object.values(nodes).every(Boolean);
        const escape = all && metrics.consciousness >= 70;
        const startedAt = get().startedAt ?? Date.now();
        const finishedAt = escape ? Date.now() : get().finishedAt;
        const elapsedSeconds = escape
          ? elapsedFrom(startedAt, finishedAt)
          : get().elapsedSeconds;
        set({
          nodes,
          metrics,
          best,
          startedAt,
          finishedAt,
          elapsedSeconds,
          screen: escape ? "escape" : "deck",
        });
      },
      setLive: (partial: Partial<Metrics>) =>
        set((s: { metrics: Metrics; nodes: Record<NodeId, boolean> }) => {
          const metrics = { ...s.metrics, ...partial };
          metrics.consciousness = computeScore(metrics, s.nodes);
          return { metrics };
        }),
      reset: () =>
        set({
          screen: "boot",
          metrics: { ...initialMetrics },
          nodes: { glyph: false, calibrate: false, sort: false, dash: false },
          log: ["RESET — construct herstart."],
          startedAt: null,
          finishedAt: null,
          elapsedSeconds: 0,
        }),
    }),
    { name: "lattice-wake-v2" },
  ),
);
