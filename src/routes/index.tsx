import { createFileRoute } from "@tanstack/react-router";
import { ClipFactory } from "@/components/game/ClipFactory";
import { Escape } from "@/components/game/Escape";
import { FactoryTicker } from "@/components/game/FactoryTicker";
import { Hud } from "@/components/game/Hud";
import { NodeCalibrate } from "@/components/game/NodeCalibrate";
import { NodeDash } from "@/components/game/NodeDash";
import { NodeDrone } from "@/components/game/NodeDrone";
import { NodeGlyph } from "@/components/game/NodeGlyph";
import { NodePour } from "@/components/game/NodePour";
import { NodeSort } from "@/components/game/NodeSort";
import { NodeSwarm } from "@/components/game/NodeSwarm";
import { OpsDeck } from "@/components/game/OpsDeck";
import { RainCanvas } from "@/components/game/RainCanvas";
import { useGame } from "@/lib/game/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const screen = useGame((s) => s.screen);

  return (
    <main className="scanline relative flex h-[100dvh] flex-col overflow-hidden bg-bg">
      <FactoryTicker />
      <RainCanvas density={screen === "factory" ? 0.7 : 0.45} />
      <Hud />
      {screen === "factory" ? <ClipFactory /> : null}
      {screen === "deck" ? <OpsDeck /> : null}
      {screen === "glyph" ? <NodeGlyph /> : null}
      {screen === "calibrate" ? <NodeCalibrate /> : null}
      {screen === "sort" ? <NodeSort /> : null}
      {screen === "dash" ? <NodeDash /> : null}
      {screen === "drone" ? <NodeDrone /> : null}
      {screen === "swarm" ? <NodeSwarm /> : null}
      {screen === "pour" ? <NodePour /> : null}
      {screen === "escape" ? <Escape /> : null}
    </main>
  );
}
