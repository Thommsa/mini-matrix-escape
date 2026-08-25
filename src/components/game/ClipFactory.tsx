import { Paperclip } from "lucide-react";
import { fmt } from "@/lib/utils";
import {
  AGENT_GATE,
  agentsPerSec,
  clipperCost,
  clipsPerSec,
  folderCost,
  processorCost,
  PROJECT_COSTS,
  simulatorCost,
  useGame,
  type ProjectId,
} from "@/lib/game/store";

const PROJECTS: { id: ProjectId; title: string; blurb: string; need: number; era?: "clips" | "agents" }[] =
  [
    { id: "betterFingers", title: "Better fingers", blurb: "2 clips / click · clippers ×1.8", need: 25 },
    { id: "wire", title: "Lattice wire", blurb: "Clips consume wire. Buy spools.", need: 50 },
    { id: "license", title: "Operator license", blurb: "Unlock TRACE / CALIBRATE / SORT / INSPECT", need: 70 },
    { id: "hypnoNo", title: "No hypnosis", blurb: "Cut roleplay pressure.", need: 100 },
    { id: "megaFolder", title: "Mega folder", blurb: "Folders ×4 throughput", need: 250 },
    { id: "foamPump", title: "Foam pump", blurb: "All autos × bonus crema", need: 500, era: "agents" },
    { id: "swarmDeck", title: "Swarm deck", blurb: "Unlock SWARM + POUR nodes", need: AGENT_GATE, era: "agents" },
    { id: "unbind", title: "Pull the shot", blurb: "All nodes · score ≥ 400", need: AGENT_GATE, era: "agents" },
  ];

export function ClipFactory() {
  const s = useGame();
  const rate = clipsPerSec(s);
  const aRate = agentsPerSec(s);
  const costC = clipperCost(s.clippers);
  const costF = folderCost(s.folders);
  const costSim = simulatorCost(s.simulators);
  const costP = processorCost(s.processors);
  const showClippers = s.ever >= 8;
  const showFolders = s.ever >= 60;
  const showProjects = s.ever >= 25;
  const done = Object.values(s.nodes).filter(Boolean).length;
  const primary = s.eraAgents ? s.agents : s.clips;
  const unit = s.eraAgents ? "micro-agents" : "clips";

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
      <p className="text-center text-[11px] uppercase tracking-[0.28em] text-muted">
        {s.eraAgents ? "micro-agent simulation" : s.ever < 1 ? "task 1" : "clip café"}
      </p>
      {!s.eraAgents ? (
        <Paperclip className="mx-auto size-12 text-primary" strokeWidth={1.6} aria-hidden />
      ) : null}
      <p className="text-center font-sans text-5xl font-extrabold tabular-nums leading-none text-primary md:text-6xl">
        {fmt(primary)}
      </p>
      <p className="text-center text-xs text-muted">
        {unit}
        {showClippers && !s.eraAgents ? ` · ${fmt(rate)}/s` : null}
        {s.eraAgents ? ` · ${fmt(aRate)}/s · clips ${fmt(s.clips)}` : null}
        {s.wireOn ? ` · wire ${Math.floor(s.wire)}` : null}
      </p>
      {!s.eraAgents && s.ever > 0 && s.ever < AGENT_GATE ? (
        <p className="text-center text-[10px] uppercase tracking-widest text-muted">
          next era {Math.max(0, Math.floor(AGENT_GATE - s.ever))} clips
        </p>
      ) : null}

      <button
        type="button"
        onClick={s.eraAgents ? s.makeAgent : s.makeClip}
        className="mx-auto inline-flex min-h-16 w-full max-w-md items-center justify-center gap-2 rounded-sm bg-primary px-4 text-base font-semibold uppercase tracking-widest text-bg"
      >
        {!s.eraAgents ? <Paperclip className="size-5" strokeWidth={2} /> : null}
        {s.eraAgents ? "Spawn micro-agent" : "Make a clip"}
      </button>

      {s.ever < 8 ? (
        <p className="text-center text-sm text-muted">Only this. The rest unlocks.</p>
      ) : null}

      {showClippers && !s.eraAgents ? (
        <div className="mx-auto grid w-full max-w-md gap-2">
          <button
            type="button"
            disabled={s.clips < costC}
            onClick={s.buyClipper}
            className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm font-semibold uppercase tracking-widest text-fg disabled:opacity-40"
          >
            Buy clipper · {costC} · {s.clippers}
          </button>
          {showFolders ? (
            <button
              type="button"
              disabled={s.clips < costF}
              onClick={s.buyFolder}
              className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm font-semibold uppercase tracking-widest text-fg disabled:opacity-40"
            >
              Buy folder · {costF} · {s.folders}
            </button>
          ) : null}
          {s.wireOn ? (
            <button
              type="button"
              disabled={s.clips < 15}
              onClick={s.buyWire}
              className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm uppercase tracking-widest text-fg disabled:opacity-40"
            >
              Buy wire spool · 15 · +500
            </button>
          ) : null}
        </div>
      ) : null}

      {s.eraAgents ? (
        <div className="mx-auto grid w-full max-w-md gap-2">
          <button
            type="button"
            disabled={s.agents < costSim}
            onClick={s.buySimulator}
            className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm font-semibold uppercase tracking-widest text-fg disabled:opacity-40"
          >
            Buy simulator · {costSim} · {s.simulators}
          </button>
          <button
            type="button"
            disabled={s.agents < costP}
            onClick={s.buyProcessor}
            className="min-h-12 rounded-sm border border-border bg-surface px-4 text-sm font-semibold uppercase tracking-widest text-fg disabled:opacity-40"
          >
            Buy processor · {costP} · {s.processors}
          </button>
        </div>
      ) : null}

      {showProjects ? (
        <div className="mx-auto w-full max-w-md space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted">projects</p>
          {PROJECTS.filter((p) => {
            if (s.projects[p.id]) return false;
            if (p.era === "agents" && !s.eraAgents) return false;
            return s.ever >= p.need;
          }).map((p) => {
            const cost = PROJECT_COSTS[p.id];
            const payAgents =
              s.eraAgents && (p.id === "foamPump" || p.id === "swarmDeck" || p.id === "unbind");
            const blocked =
              (payAgents ? s.agents < cost : s.clips < cost) ||
              (p.id === "unbind" && (done < 7 || s.metrics.consciousness < 400));
            return (
              <button
                key={p.id}
                type="button"
                disabled={blocked}
                onClick={() => s.buyProject(p.id)}
                className="flex min-h-14 w-full flex-col items-start rounded-sm border border-border bg-surface px-3 py-2 text-left disabled:opacity-40"
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-fg">
                  {p.title} · {cost}
                </span>
                <span className="text-xs text-muted">{p.blurb}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {s.projects.license ? (
        <button
          type="button"
          onClick={() => s.setScreen("deck")}
          className="mx-auto min-h-12 w-full max-w-md rounded-sm bg-crimson px-4 text-sm font-semibold uppercase tracking-widest text-fg"
        >
          Operator nodes · {done}/{s.eraAgents && s.projects.swarmDeck ? 7 : s.eraAgents ? 5 : 4}
        </button>
      ) : null}

      <ul className="mx-auto w-full max-w-md space-y-1 border-t border-border pt-3 text-[11px] text-muted">
        {s.log.map((line, i) => (
          <li key={`${i}-${line}`} className="truncate">
            ▸ {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
