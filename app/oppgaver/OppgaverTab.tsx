"use client";

import { useState } from "react";
import type { Oppgave, Operasjon } from "@/src/domene/typer";
import { lagOppgaver, type Innstillinger } from "@/src/domene/oppgaver";
import { useGenerertRunde } from "@/src/komponenter/useOppgaverunde";
import OppgaveListe from "./OppgaveListe";
import { Gangetabell } from "./Gangetabell";

const SIFFER_VALG = [1, 2, 3];
const ANTALL_VALG = [5, 10, 15, 20];
const ALLE_OPERASJONER: Operasjon[] = ["+", "-", "×", "÷"];

export function OppgaverTab({ leggTilPoeng }: { leggTilPoeng: (p: number) => void }) {
  const [innstillinger, setInnstillinger] = useState<Innstillinger>({
    sifrerA: 1,
    sifrerB: 1,
    operasjoner: ["+"],
    antallOppgaver: 5,
  });
  const { runde, startRunde } = useGenerertRunde<Oppgave>();

  function genererOppgaver() {
    startRunde(lagOppgaver(innstillinger));
  }

  function toggleOperasjon(operasjon: Operasjon) {
    setInnstillinger((forrige) => {
      const erValgt = forrige.operasjoner.includes(operasjon);
      if (erValgt && forrige.operasjoner.length === 1) return forrige;
      return {
        ...forrige,
        operasjoner: erValgt
          ? forrige.operasjoner.filter((valg) => valg !== operasjon)
          : [...forrige.operasjoner, operasjon],
      };
    });
  }

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-72 p-6 border-b-2 md:border-b-0 md:border-r-2 border-yellow-300 flex flex-col gap-6">
        <h2 className="text-2xl font-black text-gray-700">Innstillinger</h2>

        {(["sifrerA", "sifrerB"] as const).map((felt, index) => (
          <div key={felt}>
            <p className="font-bold text-gray-600 mb-2">
              Sifre i {index === 0 ? "1." : "2."} tall
            </p>
            <div className="flex gap-2">
              {SIFFER_VALG.map((antall) => (
                <button
                  key={antall}
                  onClick={() =>
                    setInnstillinger((forrige) => ({
                      ...forrige,
                      [felt]: antall,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                    innstillinger[felt] === antall
                      ? "bg-green-400 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
                  }`}
                >
                  {antall}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="font-bold text-gray-600 mb-2">Regnearter</p>
          <div className="flex flex-wrap gap-2">
            {ALLE_OPERASJONER.map((operasjon) => (
              <button
                key={operasjon}
                onClick={() => toggleOperasjon(operasjon)}
                className={`px-4 py-2 rounded-xl font-bold text-xl border-2 transition-colors ${
                  innstillinger.operasjoner.includes(operasjon)
                    ? "bg-purple-400 border-purple-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-purple-400"
                }`}
              >
                {operasjon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-bold text-gray-600 mb-2">Antall oppgaver</p>
          <div className="flex flex-wrap gap-2">
            {ANTALL_VALG.map((antall) => (
              <button
                key={antall}
                onClick={() =>
                  setInnstillinger((forrige) => ({
                    ...forrige,
                    antallOppgaver: antall,
                  }))
                }
                className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                  innstillinger.antallOppgaver === antall
                    ? "bg-blue-400 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {antall}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={genererOppgaver}
          className="mt-auto bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 transition-colors shadow"
        >
          Generer! 🎲
        </button>
      </aside>

      <section className="flex-1 p-6 overflow-y-auto flex gap-8 flex-wrap">
        <div className="flex-1">
          {runde.oppgaver.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <p className="text-6xl">🧮</p>
              <p className="text-xl font-bold">
                Trykk &quot;Generer!&quot; for å starte
              </p>
            </div>
          ) : (
            <OppgaveListe
              key={runde.id}
              oppgaver={runde.oppgaver}
              leggTilPoeng={leggTilPoeng}
              onNyRunde={genererOppgaver}
            />
          )}
        </div>
        <Gangetabell />
      </section>
    </div>
  );
}
