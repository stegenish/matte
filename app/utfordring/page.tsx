"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OppgaveListe from "../oppgaver/OppgaveListe";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import {
  DAGLIG_BONUS,
  belønnDagligUtfordring,
  harGjortIDag,
  lagDagligUtfordring,
} from "@/src/domene/dagligUtfordring";
import { giPoeng } from "@/src/domene/profil";

export default function UtfordringSide() {
  const router = useRouter();
  const { aktivProfil, oppdater, klar } = useProfil();
  const [bonusGitt, setBonusGitt] = useState(false);
  const [nyFunFact, setNyFunFact] = useState<string | null>(null);

  useEffect(() => {
    if (klar && !aktivProfil) router.replace("/");
  }, [klar, aktivProfil, router]);

  // Genererer oppgavesettet kun når profilen byttes — ikke når poeng-/faktaStatus
  // endres underveis i utfordringen. Innholdet er en snapshot av profil-tilstand
  // ved sidebesøk, så vi vil bevisst ikke ta med aktivProfil i deps.
  const profilId = aktivProfil?.id;
  const oppgaver = useMemo(() => {
    return aktivProfil ? lagDagligUtfordring(aktivProfil) : [];
    // aktivProfil er bevisst ikke i deps — vi vil ha snapshot, ikke live data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilId]);

  if (!klar || !aktivProfil) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-yellow-100">
        <p className="text-2xl text-gray-500">Laster …</p>
      </main>
    );
  }

  const allereGjort = harGjortIDag(aktivProfil);
  const profil = aktivProfil;

  function leggTilPoeng(p: number) {
    oppdater((forrige) => giPoeng(forrige, p));
  }

  function avslutt() {
    if (bonusGitt) return;
    const forhåndsvisning = belønnDagligUtfordring(profil);
    setBonusGitt(forhåndsvisning.bonusGitt);
    setNyFunFact(forhåndsvisning.nyFunFact);
    oppdater((forrige) => belønnDagligUtfordring(forrige).profil);
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
          key={profil.id}
          oppgaver={oppgaver}
          leggTilPoeng={leggTilPoeng}
          onNyRunde={() => router.push("/")}
          onFerdig={avslutt}
        />
      </section>
    </main>
  );
}
