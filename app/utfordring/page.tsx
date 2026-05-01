"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OppgaveListe from "../oppgaver/OppgaveListe";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import {
  DAGLIG_BONUS,
  harGjortIDag,
  lagDagligUtfordring,
  markerGjortIDag,
} from "@/src/domene/dagligUtfordring";
import { FUN_FACTS } from "@/src/domene/titler";

export default function UtfordringSide() {
  const router = useRouter();
  const { aktivProfil, oppdater, klar } = useProfil();
  const [bonusGitt, setBonusGitt] = useState(false);
  const [nyFunFact, setNyFunFact] = useState<string | null>(null);

  useEffect(() => {
    if (klar && !aktivProfil) router.replace("/");
  }, [klar, aktivProfil, router]);

  // Ferskt sett oppgaver basert på profilen ved første render
  const oppgaver = useMemo(
    () => (aktivProfil ? lagDagligUtfordring(aktivProfil) : []),
    [aktivProfil?.id], // bare regenerer når profilen byttes, ikke ved poeng-endring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  if (!klar || !aktivProfil) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-yellow-100">
        <p className="text-2xl text-gray-500">Laster …</p>
      </main>
    );
  }

  const allereGjort = harGjortIDag(aktivProfil);

  function leggTilPoeng(p: number) {
    if (!aktivProfil) return;
    oppdater({ ...aktivProfil, poeng: aktivProfil.poeng + p });
  }

  function avslutt() {
    if (!aktivProfil || bonusGitt) return;
    setBonusGitt(true);
    // Lås opp neste fun fact (hvis tilgjengelig)
    const nesteFakta = FUN_FACTS[aktivProfil.funFactsSamlet.length];
    let oppdatert = markerGjortIDag(aktivProfil);
    oppdatert = { ...oppdatert, poeng: oppdatert.poeng + DAGLIG_BONUS };
    if (nesteFakta && !aktivProfil.funFactsSamlet.includes(nesteFakta)) {
      oppdatert = {
        ...oppdatert,
        funFactsSamlet: [...oppdatert.funFactsSamlet, nesteFakta],
      };
      setNyFunFact(nesteFakta);
    }
    oppdater(oppdatert);
  }

  return (
    <main className="min-h-screen bg-yellow-100 flex flex-col">
      <div className="flex items-center px-6 py-4 gap-3">
        <Link
          href="/"
          className="text-xl font-bold text-green-600 hover:text-green-700"
        >
          ← Tilbake
        </Link>
        <h1 className="flex-1 text-center text-3xl font-black text-purple-600">
          🎯 Dagens utfordring
        </h1>
        <span className="text-3xl">{aktivProfil.avatar}</span>
      </div>

      <section className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        {allereGjort && !bonusGitt && (
          <div className="bg-yellow-200 border-2 border-yellow-400 rounded-2xl p-3 mb-4 text-center">
            <p className="font-bold text-gray-700">
              Du har allerede gjort dagens utfordring i dag — kos deg gjerne
              uansett, men ingen ny bonus før i morgen.
            </p>
          </div>
        )}
        {bonusGitt && (
          <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-4 mb-4">
            <p className="text-2xl font-black text-green-700 mb-1">
              Godt jobbet! +{DAGLIG_BONUS} bonuspoeng ⭐
            </p>
            {nyFunFact && (
              <p className="text-sm text-gray-700 italic">💡 {nyFunFact}</p>
            )}
          </div>
        )}

        <OppgaveListe
          oppgaver={oppgaver}
          leggTilPoeng={leggTilPoeng}
          onNyRunde={() => router.push("/")}
          onFerdig={avslutt}
        />
      </section>
    </main>
  );
}
