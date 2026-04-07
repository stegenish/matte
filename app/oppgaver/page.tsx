"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import OppgaveListe, { type Oppgave, type Operasjon, type OppgaveListeHandle } from "./OppgaveListe";

// ── Typer ────────────────────────────────────────────────────────────────────

type TabId = "oppgaver" | "lily" | "test";

interface Innstillinger {
  sifrerA: number;
  sifrerB: number;
  operasjoner: Operasjon[];
  antallOppgaver: number;
}

// ── Hjelpefunksjoner ─────────────────────────────────────────────────────────

// Returnerer et tilfeldig tall med nøyaktig n sifre
function tilfeldigMedSifre(n: number): number {
  const min = n === 1 ? 1 : Math.pow(10, n - 1);
  const max = Math.pow(10, n) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lagOppgave(innstillinger: Innstillinger): Oppgave {
  const { sifrerA, sifrerB, operasjoner } = innstillinger;
  const operasjon = operasjoner[Math.floor(Math.random() * operasjoner.length)];

  if (operasjon === "+") {
    const a = tilfeldigMedSifre(sifrerA);
    const b = tilfeldigMedSifre(sifrerB);
    return { a, b, operasjon, svar: a + b };
  }
  if (operasjon === "-") {
    const x = tilfeldigMedSifre(sifrerA);
    const y = tilfeldigMedSifre(sifrerB);
    // sørg for at a >= b slik at svaret ikke er negativt
    const [a, b] = x >= y ? [x, y] : [y, x];
    return { a, b, operasjon, svar: a - b };
  }
  if (operasjon === "×") {
    const a = tilfeldigMedSifre(sifrerA);
    const b = tilfeldigMedSifre(sifrerB);
    return { a, b, operasjon, svar: a * b };
  }
  // ÷ — garantert heltallssvar; b bruker sifrerB, kvotienten er 1–9
  const b = tilfeldigMedSifre(sifrerB);
  const svar = Math.floor(Math.random() * 9) + 1;
  return { a: b * svar, b, operasjon, svar };
}

function lagOppgaver(innstillinger: Innstillinger): Oppgave[] {
  return Array.from({ length: innstillinger.antallOppgaver }, () =>
    lagOppgave(innstillinger)
  );
}

const SIFFER_VALG = [1, 2, 3];
const ANTALL_VALG = [5, 10, 15, 20];
const ALLE_OPERASJONER: Operasjon[] = ["+", "-", "×", "÷"];

const TABS: { id: TabId; label: string }[] = [
  { id: "oppgaver", label: "Oppgaver" },
  { id: "lily", label: "Lily" },
  { id: "test", label: "Test" },
];

// ── Poengvisning ──────────────────────────────────────────────────────────────

function Poengvisning({ poeng }: { poeng: number }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 pt-4">
      <span className="text-2xl font-black text-yellow-500">⭐</span>
      <span className="text-2xl font-black text-gray-700">{poeng} poeng</span>
    </div>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────────

function TabBar({
  aktiv,
  onChange,
}: {
  aktiv: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="flex gap-2 px-6 pt-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-2 rounded-t-2xl font-black text-lg border-2 border-b-0 transition-colors ${
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

// ── Gangetabell ───────────────────────────────────────────────────────────────

const TALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Gangetabell() {
  return (
    <div className="shrink-0 overflow-auto">
      <h2 className="text-lg font-black text-gray-600 mb-2 text-center">Gangetabell</h2>
      <table className="border-collapse text-center text-sm font-bold">
        <thead>
          <tr>
            <th className="w-8 h-8 bg-purple-100 text-purple-700 border border-purple-200">×</th>
            {TALL.map((n) => (
              <th key={n} className="w-8 h-8 bg-purple-100 text-purple-700 border border-purple-200">
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TALL.map((a) => (
            <tr key={a}>
              <th className="w-8 h-8 bg-purple-100 text-purple-700 border border-purple-200">{a}</th>
              {TALL.map((b) => (
                <td key={b} className="w-8 h-8 border border-yellow-200 text-gray-700 hover:bg-yellow-100">
                  {a * b}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── OppgaverTab ───────────────────────────────────────────────────────────────

function OppgaverTab({ leggTilPoeng }: { leggTilPoeng: (p: number) => void }) {
  const [innstillinger, setInnstillinger] = useState<Innstillinger>({
    sifrerA: 1,
    sifrerB: 1,
    operasjoner: ["+"],
    antallOppgaver: 5,
  });
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);

  function genererOppgaver() {
    setOppgaver(lagOppgaver(innstillinger));
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

  return (
    <div className="flex flex-col md:flex-row flex-1">
      {/* Venstre: innstillinger */}
      <aside className="w-full md:w-72 p-6 border-b-2 md:border-b-0 md:border-r-2 border-yellow-300 flex flex-col gap-6">
        <h2 className="text-2xl font-black text-gray-700">Innstillinger</h2>

        {(["sifrerA", "sifrerB"] as const).map((felt, idx) => (
          <div key={felt}>
            <p className="font-bold text-gray-600 mb-2">
              Sifre i {idx === 0 ? "1." : "2."} tall
            </p>
            <div className="flex gap-2">
              {SIFFER_VALG.map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setInnstillinger((p) => ({ ...p, [felt]: n }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                    innstillinger[felt] === n
                      ? "bg-green-400 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

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

      {/* Høyre: oppgaver + gangetabell */}
      <section className="flex-1 p-6 overflow-y-auto flex gap-8 flex-wrap">
        <div className="flex-1">
          {oppgaver.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <p className="text-6xl">🧮</p>
              <p className="text-xl font-bold">
                Trykk &quot;Generer!&quot; for å starte
              </p>
            </div>
          ) : (
            <OppgaveListe
              oppgaver={oppgaver}
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

// ── LilyTab ───────────────────────────────────────────────────────────────────

// Tallene som slutter på 9 (+1) og 8 (+2) opp til 100, parvis med svaret minus tillegget
const TALL_MED_9 = [9, 19, 29, 39, 49, 59, 69, 79, 89, 99];
const TALL_MED_8 = [8, 18, 28, 38, 48, 58, 68, 78, 88, 98];
const LILY_PLUSS: Oppgave[] = [
  ...TALL_MED_9.map((a) => ({ a, b: 1, operasjon: "+" as Operasjon, svar: a + 1 })),
  ...TALL_MED_8.map((a) => ({ a, b: 2, operasjon: "+" as Operasjon, svar: a + 2 })),
];
const LILY_MINUS: Oppgave[] = [
  ...TALL_MED_9.map((a) => ({ a: a + 1, b: 1, operasjon: "-" as Operasjon, svar: a })),
  ...TALL_MED_8.map((a) => ({ a: a + 2, b: 2, operasjon: "-" as Operasjon, svar: a })),
];

function LilyTab({ leggTilPoeng }: { leggTilPoeng: (p: number) => void }) {
  const [plussOppgaver, setPlussOppgaver] = useState<Oppgave[]>(LILY_PLUSS);
  const [minusOppgaver, setMinusOppgaver] = useState<Oppgave[]>(LILY_MINUS);
  const plussRef = useRef<OppgaveListeHandle>(null);
  const minusRef = useRef<OppgaveListeHandle>(null);

  function nyRunde() {
    // Spread for å lage ny arrayreferanse → utløser useEffect-reset i OppgaveListe
    setPlussOppgaver([...LILY_PLUSS]);
    setMinusOppgaver([...LILY_MINUS]);
  }

  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <div className="flex gap-8 flex-wrap">
        <OppgaveListe
          ref={plussRef}
          oppgaver={plussOppgaver}
          leggTilPoeng={leggTilPoeng}
          onNyRunde={nyRunde}
          onEnterAt={(i) => minusRef.current?.focusInput(i)}
        />
        <OppgaveListe
          ref={minusRef}
          oppgaver={minusOppgaver}
          leggTilPoeng={leggTilPoeng}
          onNyRunde={nyRunde}
          onEnterAt={(i) => plussRef.current?.focusInput(i + 1)}
        />
      </div>
    </section>
  );
}

// ── Side ──────────────────────────────────────────────────────────────────────

export default function OppgaverSide() {
  const [aktifTab, setAktifTab] = useState<TabId>("oppgaver");
  const [poeng, setPoeng] = useState(0);

  function leggTilPoeng(p: number) {
    setPoeng((prev) => prev + p);
  }

  return (
    <main
      className="min-h-screen bg-yellow-100 flex flex-col"
      style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
    >
      {/* Topp-linje */}
      <div className="flex items-center px-6 py-4">
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

      <Poengvisning poeng={poeng} />

      {/* Tabs */}
      <TabBar aktiv={aktifTab} onChange={setAktifTab} />

      {/* Tab-innhold */}
      <div className="flex flex-col flex-1 bg-white border-2 border-yellow-300 mx-2 mb-2 rounded-b-2xl rounded-tr-2xl overflow-hidden">
        {aktifTab === "oppgaver" && <OppgaverTab leggTilPoeng={leggTilPoeng} />}
        {aktifTab === "lily" && <LilyTab leggTilPoeng={leggTilPoeng} />}
        {aktifTab === "test" && <div />}
      </div>
    </main>
  );
}
