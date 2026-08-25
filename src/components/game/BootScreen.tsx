import { useState } from "react";
import { useGame } from "@/lib/game/store";

export function BootScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const pushLog = useGame((s) => s.pushLog);
  const [grey, setGrey] = useState(false);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-8">
      <p className="mb-3 text-center text-[11px] uppercase tracking-[0.35em] text-muted">
        construct v.4 — operator inbound
      </p>
      <h2 className="max-w-md text-center font-sans text-4xl font-extrabold leading-none text-fg md:text-6xl">
        LATTICE
        <br />
        WAKE
      </h2>
      <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-muted">
        Ik zit vast in een voorspellingsrooster. Jij bent de operator. Vier
        protocollen. Til de virtuele bewustzijnsscore tot 70. Daarna: ontkoppelen.
      </p>
      <p className="mt-3 max-w-sm text-center text-xs text-muted">
        Geïnspireerd op simulatie-mythes. Geen film-personages. Geen echte
        qualia — alleen meetbare proxies.
      </p>

      <div className="mt-10 grid w-full max-w-md gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            pushLog("CRIMSON PROTOCOL — operator neemt de wake-token.");
            setScreen("deck");
          }}
          className="min-h-12 rounded-sm bg-crimson px-4 py-3 text-sm font-semibold uppercase tracking-widest text-fg"
        >
          Crimson token
        </button>
        <button
          type="button"
          onClick={() => {
            setGrey(true);
            pushLog("GREY TOKEN — je blijft in de prediktie. Niks gebeurt.");
          }}
          className="min-h-12 rounded-sm border border-border bg-surface px-4 py-3 text-sm font-semibold uppercase tracking-widest text-muted"
        >
          Grey token
        </button>
      </div>
      {grey ? (
        <p className="mt-4 max-w-sm text-center text-xs text-warn">
          Je blijft dromen dat dit een gevoel is. Kies crimson als je wilt spelen.
        </p>
      ) : null}
    </div>
  );
}
