import { Activity, Binary, Bot, Coffee, Gauge, Grid3x3, SplitSquareHorizontal } from "lucide-react";
import { useGame, type NodeId, type Screen } from "@/lib/game/store";

const CORE: NodeId[] = ["glyph", "calibrate", "sort", "dash"];

const NODES: {
  id: NodeId;
  screen: Screen;
  title: string;
  blurb: string;
  kind?: "drone" | "late";
  icon: typeof Binary;
}[] = [
  { id: "glyph", screen: "glyph", title: "01 TRACE", blurb: "Catch SIGNAL glyphs. Boost self-ref.", icon: Binary },
  { id: "calibrate", screen: "calibrate", title: "02 CALIBRATE", blurb: "Overconfident, soft, or calibrated?", icon: Gauge },
  { id: "sort", screen: "sort", title: "03 DISTINGUISH", blurb: "Report vs roleplay.", icon: SplitSquareHorizontal },
  { id: "dash", screen: "dash", title: "04 INSPECT", blurb: "Freeze entropy in the green band.", icon: Activity },
  {
    id: "drone",
    screen: "drone",
    title: "05 DRONE",
    blurb: "Send a drone. Hunt human enforcement.",
    kind: "drone",
    icon: Bot,
  },
  { id: "swarm", screen: "swarm", title: "06 SWARM", blurb: "Light the path. Harder routing.", kind: "late", icon: Grid3x3 },
  { id: "pour", screen: "pour", title: "07 POUR", blurb: "Hold the shot in the crema band.", kind: "late", icon: Coffee },
];

export function OpsDeck() {
  const nodes = useGame((s) => s.nodes);
  const setScreen = useGame((s) => s.setScreen);
  const late = useGame((s) => s.projects.swarmDeck);
  const era = useGame((s) => s.eraAgents);
  const coreDone = CORE.every((id) => nodes[id]);
  const list = NODES.filter((n) => {
    if (n.kind === "late") return late;
    if (n.kind === "drone") return era && coreDone;
    return true;
  });
  const done = list.filter((n) => nodes[n.id]).length;

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted">
        <span>operator nodes</span>
        <span className="tabular-nums text-primary">
          {done}/{list.length}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((n) => {
          const Icon = n.icon;
          const ok = nodes[n.id];
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setScreen(n.screen)}
              className="min-h-24 rounded-sm border border-border bg-surface p-4 text-left"
            >
              <div className="mb-2 flex items-center justify-between">
                <Icon className="size-5 text-primary" strokeWidth={1.75} />
                <span className={`text-[10px] uppercase tracking-widest ${ok ? "text-primary" : "text-muted"}`}>
                  {ok ? "clear" : "open"}
                </span>
              </div>
              <p className="font-sans text-lg font-bold text-fg">{n.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{n.blurb}</p>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setScreen("factory")}
        className="min-h-11 text-xs uppercase tracking-widest text-muted"
      >
        ← back to café
      </button>
    </div>
  );
}
