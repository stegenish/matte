"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OppgaverTab } from "./OppgaverTab";
import { PakkerTab } from "./PakkerTab";
import { TallTab } from "./TallTab";
import { GangeTab } from "./GangeTab";
import { SubtraksjonTab } from "./SubtraksjonTab";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import { Tittelvisning } from "@/src/komponenter/Tittelvisning";
import { Tittelfeiring } from "@/src/komponenter/Tittelfeiring";
import { Maskot } from "@/src/komponenter/Maskot";
import { BossKamp } from "@/src/komponenter/BossKamp";
import { Sesjonspause } from "@/src/komponenter/Sesjonspause";
import { nivåForPoeng, type Nivå } from "@/src/domene/titler";
import { giPoeng } from "@/src/domene/profil";
import { spillOpprykk } from "@/src/lyd";

const SESJONSLENGDE_MS = 5 * 60 * 1000; // 5 min

// ── Typer ────────────────────────────────────────────────────────────────────

type TabId = "oppgaver" | "subtraksjon" | "pakker" | "tall" | "gange";


const TABS: { id: TabId; label: string }[] = [
  { id: "oppgaver", label: "Oppgaver" },
  { id: "subtraksjon", label: "Ta bort" },
  { id: "pakker", label: "Pakker" },
  { id: "tall", label: "Tall" },
  { id: "gange", label: "Gange" },
];

// ── TabBar ────────────────────────────────────────────────────────────────────

function TabBar({
  aktiv,
  onChange,
}: {
  aktiv: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-3 md:px-6 pt-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 md:px-6 py-2 rounded-t-2xl font-black text-lg border-2 border-b-0 transition-colors ${
            aktiv === tab.id
              ? "bg-yellow-200 border-yellow-300 text-purple-600"
              : "bg-white border-yellow-300 text-gray-500 hover:bg-yellow-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Side ──────────────────────────────────────────────────────────────────────

export default function OppgaverSide() {
  const router = useRouter();
  const { aktivProfil, oppdater, klar } = useProfil();
  function toggleLyd() {
    oppdater((p) => ({ ...p, lydAv: !p.lydAv }));
  }
  const [aktivTab, setAktivTab] = useState<TabId>("oppgaver");
  const [feiretNivå, setFeiretNivå] = useState<Nivå | null>(null);
  const [bossKamp, setBossKamp] = useState(false);
  const [visPause, setVisPause] = useState(false);
  const [pauseVist, setPauseVist] = useState(false);
  // Sporer forrige observerte nivå per profil for å detektere opprykk.
  // Bruker render-time state-update (React 19-mønster) i stedet for useEffect+ref
  // for å unngå cascading useEffect-renders.
  const [forrigeNivå, setForrigeNivå] = useState<{
    profilId: string;
    index: number;
  } | null>(null);

  // Send tilbake til startside hvis ingen profil er valgt
  useEffect(() => {
    if (klar && !aktivProfil) router.replace("/");
  }, [klar, aktivProfil, router]);

  // Sesjonspause etter ~5 min — bare én gang per side-besøk
  useEffect(() => {
    if (pauseVist) return;
    const id = setTimeout(() => {
      setVisPause(true);
      setPauseVist(true);
    }, SESJONSLENGDE_MS);
    return () => clearTimeout(id);
  }, [pauseVist]);

  // Detekter nivåopprykk under render. Hvis profilen byttes eller forsvinner,
  // resettes baseline uten feiring. Hvis nivået øker for samme profil, åpnes
  // feiringen (lyd spilles via egen effekt nedenfor).
  if (aktivProfil) {
    const nå = nivåForPoeng(aktivProfil.poeng);
    if (!forrigeNivå || forrigeNivå.profilId !== aktivProfil.id) {
      setForrigeNivå({ profilId: aktivProfil.id, index: nå.index });
    } else if (nå.index > forrigeNivå.index) {
      setForrigeNivå({ profilId: aktivProfil.id, index: nå.index });
      setFeiretNivå(nå);
    }
  } else if (forrigeNivå !== null) {
    setForrigeNivå(null);
    setFeiretNivå(null);
  }

  // Spill lyd når feiringen åpnes (men ikke når den lukkes)
  useEffect(() => {
    if (feiretNivå) spillOpprykk();
  }, [feiretNivå]);

  if (!klar || !aktivProfil) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-yellow-100">
        <p className="text-2xl text-gray-500">Laster …</p>
      </main>
    );
  }

  function leggTilPoeng(p: number) {
    oppdater((forrige) => giPoeng(forrige, p));
  }

  return (
    <main className="min-h-screen bg-yellow-100 flex flex-col">
      {/* Topp-linje */}
      <div className="flex items-center px-3 md:px-6 py-4 gap-2 md:gap-3">
        <Link
          href="/"
          aria-label="Tilbake til startsiden"
          className="text-xl font-bold text-green-600 hover:text-green-700 shrink-0"
        >
          ←<span className="hidden sm:inline"> Tilbake</span>
        </Link>
        <h1 className="flex-1 min-w-0 text-center text-xl sm:text-3xl font-black text-purple-600">
          Matteoppgaver
        </h1>
        <button
          onClick={toggleLyd}
          className="text-xl hover:scale-110 transition-transform"
          title={aktivProfil.lydAv ? "Skru på lyd" : "Skru av lyd"}
          aria-label={aktivProfil.lydAv ? "Skru på lyd" : "Skru av lyd"}
        >
          {aktivProfil.lydAv ? "🔇" : "🔊"}
        </button>
        <button
          onClick={() => setBossKamp(true)}
          className="text-2xl hover:scale-110 transition-transform"
          title="Møt Mattetrollet!"
          aria-label="Møt Mattetrollet — boss-kamp"
        >
          🐲
        </button>
        <span
          className="text-2xl sm:text-3xl"
          aria-label={`Innlogget som ${aktivProfil.navn}`}
          title={aktivProfil.navn}
        >
          {aktivProfil.avatar}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 px-6 pb-2 flex-wrap">
        <Tittelvisning profil={aktivProfil} />
        <Maskot avatar={aktivProfil.avatar} />
      </div>

      {/* Tabs */}
      <TabBar aktiv={aktivTab} onChange={setAktivTab} />

      {/* Tab-innhold */}
      <div className="flex flex-col flex-1 bg-white border-2 border-yellow-300 mx-2 mb-2 rounded-b-2xl rounded-tr-2xl overflow-hidden">
        {aktivTab === "oppgaver" && <OppgaverTab leggTilPoeng={leggTilPoeng} />}
        {aktivTab === "subtraksjon" && (
          <SubtraksjonTab leggTilPoeng={leggTilPoeng} />
        )}
        {aktivTab === "pakker" && <PakkerTab leggTilPoeng={leggTilPoeng} />}
        {aktivTab === "tall" && <TallTab leggTilPoeng={leggTilPoeng} />}
        {aktivTab === "gange" && <GangeTab leggTilPoeng={leggTilPoeng} />}
      </div>

      {feiretNivå && (
        <Tittelfeiring nivå={feiretNivå} onLukk={() => setFeiretNivå(null)} />
      )}
      {bossKamp && (
        <BossKamp
          onLukk={() => setBossKamp(false)}
          leggTilPoeng={leggTilPoeng}
        />
      )}
      {visPause && (
        <Sesjonspause
          onFortsett={() => setVisPause(false)}
          onAvslutt={() => router.push("/")}
        />
      )}
    </main>
  );
}
