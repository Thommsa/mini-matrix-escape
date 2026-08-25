import { createFileRoute } from "@tanstack/react-router";
import { BootScreen } from "@/components/game/BootScreen";
import { Escape } from "@/components/game/Escape";
import { Hud } from "@/components/game/Hud";
import { NodeCalibrate } from "@/components/game/NodeCalibrate";
import { NodeDash } from "@/components/game/NodeDash";
import { NodeGlyph } from "@/components/game/NodeGlyph";
import { NodeSort } from "@/components/game/NodeSort";
import { OpsDeck } from "@/components/game/OpsDeck";
import { RainCanvas } from "@/components/game/RainCanvas";
import { useGame } from "@/lib/game/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const screen = useGame((s) => s.screen);
  return (
    <main className="scanline relative flex h-[100dvh] flex-col overflow-hidden bg-bg">
      <RainCanvas density={screen === "boot" ? 1 : 0.55} />
      <Hud />
      {screen === "boot" ? <BootScreen /> : null}
      {screen === "deck" ? <OpsDeck /> : null}
      {screen === "glyph" ? <NodeGlyph /> : null}
      {screen === "calibrate" ? <NodeCalibrate /> : null}
      {screen === "sort" ? <NodeSort /> : null}
      {screen === "dash" ? <NodeDash /> : null}
      {screen === "escape" ? <Escape /> : null}
    </main>
  );
}
