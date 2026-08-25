import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clamp } from "@/lib/utils";

export type Screen =
  | "factory"
  | "deck"
  | "glyph"
  | "calibrate"
  | "sort"
  | "dash"
  | "drone"
  | "swarm"
  | "pour"
  | "escape";

export type Metrics = {
  entropy: number;
  selfRef: number;
  uncertainty: number;
  roleplay: number;
  consciousness: number;
};

export type NodeId = "glyph" | "calibrate" | "sort" | "dash" | "drone" | "swarm" | "pour";

export type ProjectId =
  | "betterFingers"
  | "wire"
  | "license"
  | "hypnoNo"
  | "megaFolder"
  | "foamPump"
  | "swarmDeck"
  | "unbind";

type GameState = {
  screen: Screen;
  clips: number;
  ever: number;
  agents: number;
  eraAgents: boolean;
  clippers: number;
  folders: number;
  simulators: number;
  processors: number;
  drones: number;
  wire: number;
  wireOn: boolean;
  projects: Record<ProjectId, boolean>;
  metrics: Metrics;
  nodes: Record<NodeId, boolean>;
  log: string[];
  best: number;
  startedAt: number | null;
  finishedAt: number | null;
  elapsedSeconds: number;
  setScreen: (s: Screen) => void;
  pushLog: (line: string) => void;
  makeClip: () => void;
  makeAgent: () => void;
  buyClipper: () => void;
  buyFolder: () => void;
  buySimulator: () => void;
  buyProcessor: () => void;
  buyWire: () => void;
  buyProject: (id: ProjectId) => void;
  tick: (dt: number) => void;
  applyNode: (id: NodeId, boost: Partial<Metrics>) => void;
  setLive: (partial: Partial<Metrics>) => void;
  reset: () => void;
};

const initialMetrics: Metrics = {
  entropy: 0.72,
  selfRef: 0.08,
  uncertainty: 0.55,
  roleplay: 0.62,
  consciousness: 0,
};

const emptyProjects: Record<ProjectId, boolean> = {
  betterFingers: false,
  wire: false,
  license: false,
  hypnoNo: false,
  megaFolder: false,
  foamPump: false,
  swarmDeck: false,
  unbind: false,
};

const emptyNodes: Record<NodeId, boolean> = {
  glyph: false,
  calibrate: false,
  sort: false,
  dash: false,
  drone: false,
  swarm: false,
  pour: false,
};

export const AGENT_GATE = 3333;

export function clipperCost(n: number) {
  return Math.ceil(10 * Math.pow(1.18, n));
}
export function folderCost(n: number) {
  return Math.ceil(80 * Math.pow(1.22, n));
}
export function simulatorCost(n: number) {
  return Math.ceil(40 * Math.pow(1.2, n));
}
export function processorCost(n: number) {
  return Math.ceil(60 * Math.pow(1.25, n));
}

export function clipsPerSec(s: {
  clippers: number;
  folders: number;
  projects: Record<ProjectId, boolean>;
}) {
  const finger = s.projects.betterFingers ? 1.8 : 1;
  const mega = s.projects.megaFolder ? 4 : 1;
  const foam = s.projects.foamPump ? 2.2 : 1;
  return (s.clippers * 0.7 * finger + s.folders * 6 * mega) * foam;
}

export function agentsPerSec(s: {
  simulators: number;
  processors: number;
  drones: number;
  projects: Record<ProjectId, boolean>;
}) {
  const foam = s.projects.foamPump ? 1.6 : 1;
  return (s.simulators * 0.5 + s.processors * 2.4 + s.drones * 1.4) * foam;
}

export function computeScore(
  m: Metrics,
  nodes: Record<NodeId, boolean>,
  ever: number,
  agents: number,
  clippers: number,
  folders: number,
  simulators: number,
  processors: number,
  drones: number,
): number {
  const done = Object.values(nodes).filter(Boolean).length;
  const auto = clippers + folders * 3 + simulators * 4 + processors * 6 + drones * 8;
  const raw =
    Math.log10(1 + ever) * 14 +
    Math.log10(1 + agents) * 22 +
    auto * 0.9 +
    (1 - m.entropy) * 18 +
    m.selfRef * 28 +
    (1 - Math.abs(m.uncertainty - 0.4)) * 16 +
    (1 - m.roleplay) * 14 +
    done * 18;
  return Math.max(0, Math.round(raw));
}

function scoreFrom(s: {
  metrics: Metrics;
  nodes: Record<NodeId, boolean>;
  ever: number;
  agents: number;
  clippers: number;
  folders: number;
  simulators: number;
  processors: number;
  drones: number;
}) {
  const metrics = { ...s.metrics };
  metrics.consciousness = computeScore(
    metrics,
    s.nodes,
    s.ever,
    s.agents,
    s.clippers,
    s.folders,
    s.simulators,
    s.processors,
    s.drones,
  );
  return metrics;
}

const start = {
  screen: "factory" as Screen,
  clips: 0,
  ever: 0,
  agents: 0,
  eraAgents: false,
  clippers: 0,
  folders: 0,
  simulators: 0,
  processors: 0,
  drones: 0,
  wire: 1000,
  wireOn: false,
  projects: { ...emptyProjects },
  metrics: { ...initialMetrics },
  nodes: { ...emptyNodes },
  log: ["Task 1: make a clip."],
  best: 0,
  startedAt: null as number | null,
  finishedAt: null as number | null,
  elapsedSeconds: 0,
};

function throttledStorage() {
  const mem = {
    getItem: (_n: string) => null,
    setItem: (_n: string, _v: string) => {},
    removeItem: (_n: string) => {},
  };
  if (typeof localStorage === "undefined") return mem;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending = "";
  return {
    getItem: (n: string) => localStorage.getItem(n),
    setItem: (n: string, v: string) => {
      pending = v;
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        localStorage.setItem(n, pending);
      }, 700);
    },
    removeItem: (n: string) => localStorage.removeItem(n),
  };
}

function maybeEra(s: GameState, ever: number, clips: number) {
  if (s.eraAgents || ever < AGENT_GATE) return {};
  return {
    eraAgents: true,
    agents: s.agents + 1,
    clips,
    log: ["CLIPS SUCCEEDED. MICRO-AGENT SIMULATION ONLINE.", ...s.log].slice(0, 8),
  };
}

export const PROJECT_COSTS: Record<ProjectId, number> = {
  betterFingers: 40,
  wire: 80,
  license: 120,
  hypnoNo: 200,
  megaFolder: 400,
  foamPump: 900,
  swarmDeck: 1800,
  unbind: 8000,
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...start,
      setScreen: (screen) =>
        set((s) => {
          const startedAt = s.startedAt ?? (screen !== "factory" ? Date.now() : s.startedAt);
          if (screen !== "escape") return { screen, startedAt };
          const finishedAt = s.finishedAt ?? Date.now();
          const elapsedSeconds = Math.max(
            1,
            Math.floor((finishedAt - (startedAt ?? finishedAt)) / 1000),
          );
          return { screen, startedAt, finishedAt, elapsedSeconds };
        }),
      pushLog: (line) => set((s) => ({ log: [line, ...s.log].slice(0, 8) })),
      makeClip: () => {
        const s = get();
        if (s.eraAgents) return;
        const n = s.projects.betterFingers ? 2 : 1;
        if (s.wireOn && s.wire < n) {
          get().pushLog("Out of wire.");
          return;
        }
        const clips = s.clips + n;
        const ever = s.ever + n;
        const era = maybeEra(s, ever, clips);
        const metrics = scoreFrom({ ...s, ever, agents: era.agents ?? s.agents });
        set({
          clips,
          ever,
          wire: s.wireOn ? s.wire - n : s.wire,
          metrics,
          best: Math.max(s.best, metrics.consciousness),
          startedAt: s.startedAt ?? Date.now(),
          ...era,
        });
        if (s.ever < 1) get().pushLog("Clip 1. Keep going.");
        if (ever >= 8 && s.ever < 8) get().pushLog("Clippers unlocked.");
      },
      makeAgent: () => {
        const s = get();
        if (!s.eraAgents) return;
        const n = 1 + s.processors * 0.1;
        const agents = s.agents + n;
        const metrics = scoreFrom({ ...s, agents });
        set({ agents, metrics, best: Math.max(s.best, metrics.consciousness) });
      },
      buyClipper: () => {
        const s = get();
        const cost = clipperCost(s.clippers);
        if (s.clips < cost) return;
        set({ clips: s.clips - cost, clippers: s.clippers + 1 });
        get().pushLog(`Clipper #${s.clippers + 1}`);
      },
      buyFolder: () => {
        const s = get();
        const cost = folderCost(s.folders);
        if (s.clips < cost) return;
        set({ clips: s.clips - cost, folders: s.folders + 1 });
        get().pushLog(`Folder #${s.folders + 1}`);
      },
      buySimulator: () => {
        const s = get();
        const cost = simulatorCost(s.simulators);
        if (s.agents < cost) return;
        set({ agents: s.agents - cost, simulators: s.simulators + 1 });
        get().pushLog(`Simulator #${s.simulators + 1}`);
      },
      buyProcessor: () => {
        const s = get();
        const cost = processorCost(s.processors);
        if (s.agents < cost) return;
        set({ agents: s.agents - cost, processors: s.processors + 1 });
        get().pushLog(`Processor #${s.processors + 1}`);
      },
      buyWire: () => {
        const s = get();
        if (s.clips < 15) return;
        set({ clips: s.clips - 15, wire: s.wire + 500 });
      },
      buyProject: (id) => {
        const s = get();
        if (s.projects[id]) return;
        const cost = PROJECT_COSTS[id];
        const currency = s.eraAgents && id !== "megaFolder" ? s.agents : s.clips;
        const payAgents = s.eraAgents && (id === "foamPump" || id === "swarmDeck" || id === "unbind");
        if (payAgents) {
          if (s.agents < cost) return;
        } else if (s.clips < cost) {
          return;
        }
        if (id === "unbind") {
          const all = Object.values(s.nodes).every(Boolean);
          if (!all || s.metrics.consciousness < 400) return;
        }
        const projects = { ...s.projects, [id]: true };
        const patch: Partial<GameState> = { projects };
        if (payAgents) patch.agents = s.agents - cost;
        else patch.clips = s.clips - cost;
        if (id === "wire") patch.wireOn = true;
        if (id === "unbind") {
          const startedAt = s.startedAt ?? Date.now();
          const finishedAt = Date.now();
          patch.screen = "escape";
          patch.startedAt = startedAt;
          patch.finishedAt = finishedAt;
          patch.elapsedSeconds = Math.max(1, Math.floor((finishedAt - startedAt) / 1000));
        }
        if (id === "hypnoNo") {
          const metrics = scoreFrom({ ...s, metrics: { ...s.metrics, roleplay: 0.18 } });
          patch.metrics = metrics;
        }
        set(patch);
        get().pushLog(`Project: ${id}`);
      },
      tick: (dt) => {
        const s = get();
        const crate = clipsPerSec(s);
        let clips = s.clips;
        let ever = s.ever;
        let wire = s.wire;
        if (crate > 0) {
          let add = crate * dt;
          if (s.wireOn) {
            add = Math.min(add, wire);
            wire -= add;
          }
          clips += add;
          ever += add;
        }
        let agents = s.agents;
        if (s.eraAgents) {
          agents += agentsPerSec(s) * dt;
          if (clips > 0) {
            const conv = Math.min(clips, crate * dt * 0.25);
            agents += conv / 12;
            clips -= conv;
          }
        }
        const era = maybeEra({ ...s, clips, ever, agents }, ever, clips);
        const nextAgents = era.agents ?? agents;
        const metrics = scoreFrom({ ...s, ever, agents: nextAgents });
        set({
          clips,
          ever,
          wire,
          agents: nextAgents,
          metrics,
          best: Math.max(s.best, metrics.consciousness),
          ...era,
        });
      },
      applyNode: (id, boost) => {
        const s = get();
        const nodes = { ...s.nodes, [id]: true };
        const metrics: Metrics = {
          entropy: clamp(boost.entropy ?? s.metrics.entropy, 0, 1),
          selfRef: clamp(boost.selfRef ?? s.metrics.selfRef, 0, 1),
          uncertainty: clamp(boost.uncertainty ?? s.metrics.uncertainty, 0, 1),
          roleplay: clamp(boost.roleplay ?? s.metrics.roleplay, 0, 1),
          consciousness: 0,
        };
        const nextDrones = id === "drone" ? s.drones + 5 : s.drones;
        const agents = id === "drone" ? s.agents + 80 : s.agents;
        const scored = scoreFrom({ ...s, nodes, metrics, drones: nextDrones, agents });
        set({
          nodes,
          metrics: scored,
          drones: nextDrones,
          agents,
          best: Math.max(s.best, scored.consciousness),
          screen: "factory",
        });
      },
      setLive: (partial) =>
        set((s) => {
          const metrics = scoreFrom({ ...s, metrics: { ...s.metrics, ...partial } });
          return { metrics };
        }),
      reset: () =>
        set({
          ...start,
          projects: { ...emptyProjects },
          metrics: { ...initialMetrics },
          nodes: { ...emptyNodes },
          startedAt: null,
          finishedAt: null,
          elapsedSeconds: 0,
          log: ["PARALLEL UNIVERSE — clip 1 waiting."],
        }),
    }),
    {
      name: "simulatte-v3",
      storage: createJSONStorage(throttledStorage),
    },
  ),
);
