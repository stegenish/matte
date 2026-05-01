"use client";

import { useEffect, useState } from "react";
import { BOSS_BONUS, lagBossOppgave } from "@/src/domene/boss";
import { nøkkelForOppgave } from "@/src/domene/faktaStatus";
import { useProfil } from "./ProfilProvider";

interface Props {
  onLukk: () => void;
  leggTilPoeng: (p: number) => void;
}

export function BossKamp({ onLukk, leggTilPoeng }: Props) {
  const { registrerSvar } = useProfil();
  const [oppgave] = useState(() => lagBossOppgave());
  const [svar, setSvar] = useState("");
  const [resultat, setResultat] = useState<"riktig" | "feil" | null>(null);

  useEffect(() => {
    function håndterKey(e: KeyboardEvent) {
      if (resultat && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        onLukk();
      }
    }
    window.addEventListener("keydown", håndterKey);
    return () => window.removeEventListener("keydown", håndterKey);
  }, [resultat, onLukk]);

  function håndterSvar() {
    if (resultat || svar === "") return;
    const erRett = Number(svar) === oppgave.svar;
    registrerSvar(nøkkelForOppgave(oppgave), erRett);
    if (erRett) leggTilPoeng(BOSS_BONUS);
    setResultat(erRett ? "riktig" : "feil");
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Boss-kamp"
    >
      <div className="relative bg-yellow-50 border-8 border-purple-700 rounded-3xl p-8 md:p-10 text-center shadow-2xl max-w-lg animate-pop">
        <p className="text-6xl mb-2">🐲</p>
        <h2 className="text-2xl md:text-3xl font-black text-purple-700 mb-2">
          Mattetrollet utfordrer deg!
        </h2>

        {resultat === null ? (
          <>
            <p className="text-sm text-gray-600 mb-5">
              Klarer du å beseire trollet? +{BOSS_BONUS} poeng om du svarer riktig.
            </p>
            <div className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-black mb-5">
              <span className="text-purple-600">{oppgave.a}</span>
              <span className="text-gray-500">×</span>
              <span className="text-green-600">{oppgave.b}</span>
              <span className="text-gray-500">=</span>
              <input
                type="number"
                value={svar}
                onChange={(e) => setSvar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") håndterSvar();
                }}
                autoFocus
                className="w-28 text-center text-4xl md:text-5xl font-black border-4 border-purple-400 focus:border-purple-600 rounded-2xl py-1 focus:outline-none"
                placeholder="?"
              />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onLukk}
                className="text-base font-bold text-gray-500 hover:text-gray-700 underline"
              >
                Stikk av
              </button>
              <button
                onClick={håndterSvar}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xl font-black px-8 py-3 rounded-2xl border-4 border-purple-800 shadow"
              >
                Slå tilbake! ⚔️
              </button>
            </div>
          </>
        ) : resultat === "riktig" ? (
          <>
            <p className="text-3xl font-black text-green-600 mb-2">
              Du beseiret trollet! 🏆
            </p>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {oppgave.a} × {oppgave.b} = {oppgave.svar}
            </p>
            <p className="text-lg font-bold text-yellow-600 mb-4">
              +{BOSS_BONUS} bonuspoeng ⭐
            </p>
            <button
              onClick={onLukk}
              className="bg-green-500 hover:bg-green-600 text-white text-xl font-black px-8 py-3 rounded-2xl border-4 border-green-700 shadow"
            >
              Tilbake
            </button>
          </>
        ) : (
          <>
            <p className="text-3xl font-black text-red-500 mb-2">
              Trollet vant denne gangen…
            </p>
            <p className="text-xl font-bold text-gray-700 mb-1">
              {oppgave.a} × {oppgave.b} = {oppgave.svar}
            </p>
            <p className="text-base text-gray-600 mb-4">Prøv igjen senere! 💪</p>
            <button
              onClick={onLukk}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black px-8 py-3 rounded-2xl border-4 border-blue-700 shadow"
            >
              Tilbake
            </button>
          </>
        )}
      </div>
    </div>
  );
}
