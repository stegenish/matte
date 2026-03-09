"use client";

import { useState } from "react";
import Link from "next/link";

type Operasjon = "+" | "-" | "×" | "÷";

interface Oppgave {
  a: number;
  b: number;
  operasjon: Operasjon;
  svar: number;
}

interface Innstillinger {
  maksVerdi: number;
  operasjoner: Operasjon[];
  antallOppgaver: number;
}

function lagOppgave(innstillinger: Innstillinger): Oppgave {
  const { maksVerdi, operasjoner } = innstillinger;
  const operasjon = operasjoner[Math.floor(Math.random() * operasjoner.length)];

  if (operasjon === "+") {
    const a = Math.floor(Math.random() * maksVerdi) + 1;
    const b = Math.floor(Math.random() * maksVerdi) + 1;
    return { a, b, operasjon, svar: a + b };
  }
  if (operasjon === "-") {
    const a = Math.floor(Math.random() * maksVerdi) + 1;
    const b = Math.floor(Math.random() * a) + 1;
    return { a, b, operasjon, svar: a - b };
  }
  if (operasjon === "×") {
    const grense = Math.min(maksVerdi, 10);
    const a = Math.floor(Math.random() * grense) + 1;
    const b = Math.floor(Math.random() * grense) + 1;
    return { a, b, operasjon, svar: a * b };
  }
  // ÷ — garantert heltallssvar
  const grense = Math.min(maksVerdi, 10);
  const b = Math.floor(Math.random() * grense) + 1;
  const svar = Math.floor(Math.random() * grense) + 1;
  return { a: b * svar, b, operasjon, svar };
}

function lagOppgaver(innstillinger: Innstillinger): Oppgave[] {
  return Array.from({ length: innstillinger.antallOppgaver }, () =>
    lagOppgave(innstillinger)
  );
}

const MAKS_VERDIER = [10, 20, 50, 100];
const ANTALL_VALG = [5, 10, 15, 20];
const ALLE_OPERASJONER: Operasjon[] = ["+", "-", "×", "÷"];

export default function OppgaverSide() {
  const [innstillinger, setInnstillinger] = useState<Innstillinger>({
    maksVerdi: 10,
    operasjoner: ["+"],
    antallOppgaver: 5,
  });
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [svar, setSvar] = useState<string[]>([]);
  const [sjekket, setSjekket] = useState(false);

  function genererOppgaver() {
    setOppgaver(lagOppgaver(innstillinger));
    setSvar(Array(innstillinger.antallOppgaver).fill(""));
    setSjekket(false);
  }

  function toggleOperasjon(op: Operasjon) {
    setInnstillinger((prev) => {
      const harAllerede = prev.operasjoner.includes(op);
      // må ha minst én operasjon
      if (harAllerede && prev.operasjoner.length === 1) return prev;
      return {
        ...prev,
        operasjoner: harAllerede
          ? prev.operasjoner.filter((o) => o !== op)
          : [...prev.operasjoner, op],
      };
    });
  }

  const antallRiktige = sjekket
    ? oppgaver.filter((o, i) => Number(svar[i]) === o.svar).length
    : 0;

  return (
    <main
      className="min-h-screen bg-yellow-100 flex flex-col"
      style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
    >
      {/* Topp-linje */}
      <div className="flex items-center px-6 py-4 border-b-2 border-yellow-300">
        <Link
          href="/"
          className="text-xl font-bold text-green-600 hover:text-green-700"
        >
          ← Tilbake
        </Link>
        <h1 className="flex-1 text-center text-3xl font-black text-purple-600">
          Matteoppgaver
        </h1>
      </div>

      {/* Todelt visning */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Venstre: innstillinger */}
        <aside className="w-full md:w-72 p-6 border-b-2 md:border-b-0 md:border-r-2 border-yellow-300 flex flex-col gap-6">
          <h2 className="text-2xl font-black text-gray-700">Innstillinger</h2>

          <div>
            <p className="font-bold text-gray-600 mb-2">Maks tall</p>
            <div className="flex flex-wrap gap-2">
              {MAKS_VERDIER.map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setInnstillinger((p) => ({ ...p, maksVerdi: v }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                    innstillinger.maksVerdi === v
                      ? "bg-green-400 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-600 mb-2">Regnearter</p>
            <div className="flex flex-wrap gap-2">
              {ALLE_OPERASJONER.map((op) => (
                <button
                  key={op}
                  onClick={() => toggleOperasjon(op)}
                  className={`px-4 py-2 rounded-xl font-bold text-xl border-2 transition-colors ${
                    innstillinger.operasjoner.includes(op)
                      ? "bg-purple-400 border-purple-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-purple-400"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-600 mb-2">Antall oppgaver</p>
            <div className="flex flex-wrap gap-2">
              {ANTALL_VALG.map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setInnstillinger((p) => ({ ...p, antallOppgaver: n }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                    innstillinger.antallOppgaver === n
                      ? "bg-blue-400 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {n}
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

        {/* Høyre: oppgaver */}
        <section className="flex-1 p-6 overflow-y-auto">
          {oppgaver.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <p className="text-6xl">🧮</p>
              <p className="text-xl font-bold">
                Trykk &quot;Generer!&quot; for å starte
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-xl">
              {sjekket && (
                <p className="text-2xl font-black text-center text-green-700 mb-2">
                  {antallRiktige} / {oppgaver.length} riktige!{" "}
                  {antallRiktige === oppgaver.length ? "🎉" : "💪"}
                </p>
              )}

              {oppgaver.map((o, i) => {
                const riktig = sjekket ? Number(svar[i]) === o.svar : null;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                      riktig === true
                        ? "border-green-400 bg-green-50"
                        : riktig === false
                        ? "border-red-300 bg-red-50"
                        : "border-yellow-200 bg-white"
                    }`}
                  >
                    <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-2xl font-bold text-purple-500">
                      {o.a}
                    </span>
                    <span className="text-2xl font-bold text-gray-500">
                      {o.operasjon}
                    </span>
                    <span className="text-2xl font-bold text-green-500">
                      {o.b}
                    </span>
                    <span className="text-2xl font-bold text-gray-500">=</span>
                    <input
                      type="number"
                      value={svar[i]}
                      onChange={(e) => {
                        const nyttSvar = [...svar];
                        nyttSvar[i] = e.target.value;
                        setSvar(nyttSvar);
                      }}
                      disabled={sjekket}
                      className={`w-20 text-center text-2xl font-bold border-2 rounded-xl py-1 focus:outline-none ${
                        riktig === true
                          ? "border-green-400 bg-green-50"
                          : riktig === false
                          ? "border-red-400 bg-red-50"
                          : "border-blue-300 focus:border-blue-500 bg-white"
                      }`}
                      placeholder="?"
                    />
                    {riktig === true && (
                      <span className="text-2xl shrink-0">✅</span>
                    )}
                    {riktig === false && (
                      <span className="text-lg font-bold text-red-500 shrink-0">
                        = {o.svar} ❌
                      </span>
                    )}
                  </div>
                );
              })}

              {!sjekket && (
                <button
                  onClick={() => setSjekket(true)}
                  className="mt-2 bg-blue-400 hover:bg-blue-500 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-blue-600 transition-colors self-start shadow"
                >
                  Sjekk svar! 🔍
                </button>
              )}
              {sjekket && (
                <button
                  onClick={genererOppgaver}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 transition-colors self-start shadow"
                >
                  Ny runde! 🎲
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
