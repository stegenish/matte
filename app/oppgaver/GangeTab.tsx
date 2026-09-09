"use client";

import { useState } from "react";
import {
  ALLE_VARIANTER,
  fasitFor,
  lagGangerunde,
  poengForGangeOppgave,
  type GangeOppgave,
  type GangeInputOppgave,
  type GangeVariant,
  type GangetabellInnstillinger,
  type SantUsantOppgave,
} from "@/src/domene/gangevariant";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import { useSvarOrkestrering } from "@/src/komponenter/useSvarOrkestrering";
import {
  useGenerertRunde,
  useOppgaverunde,
} from "@/src/komponenter/useOppgaverunde";
import { RundeResultat } from "@/src/komponenter/RundeResultat";
import { LynRunde } from "./LynRunde";
import { Gangetabell } from "./Gangetabell";

interface Props {
  leggTilPoeng: (p: number) => void;
}

const TABELL_VALG = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ANTALL_VALG = [5, 10, 15, 20];

const VARIANT_LABEL: Record<GangeVariant, string> = {
  klassisk: "Klassisk (7 × 8 = ?)",
  "manglende-faktor": "Manglende faktor (? × 8 = 56)",
  omvendt: "Omvendt (56 ÷ 8 = ?)",
  "sant-usant": "Sant eller usant (7 × 8 = 54)",
};

export function GangeTab({ leggTilPoeng }: Props) {
  const [innstillinger, setInnstillinger] = useState<GangetabellInnstillinger>({
    tabeller: [2, 5, 10],
    varianter: ["klassisk"],
    antallOppgaver: 10,
  });
  const { runde, startRunde } = useGenerertRunde<GangeOppgave>();
  const { id: rundeId, oppgaver } = runde;
  const [lynRunde, setLynRunde] = useState(false);
  const [visGangetabell, setVisGangetabell] = useState(true);

  function generer() {
    startRunde(lagGangerunde(innstillinger));
  }

  if (lynRunde) {
    return (
      <LynRunde
        tabeller={innstillinger.tabeller}
        leggTilPoeng={leggTilPoeng}
        onAvslutt={() => setLynRunde(false)}
      />
    );
  }

  function toggleTabell(t: number) {
    setInnstillinger((prev) => ({
      ...prev,
      tabeller: prev.tabeller.includes(t)
        ? prev.tabeller.filter((x) => x !== t)
        : [...prev.tabeller, t].sort((a, b) => a - b),
    }));
  }

  function toggleVariant(v: GangeVariant) {
    setInnstillinger((prev) => {
      const harAllerede = prev.varianter.includes(v);
      // Må ha minst én variant
      if (harAllerede && prev.varianter.length === 1) return prev;
      return {
        ...prev,
        varianter: harAllerede
          ? prev.varianter.filter((x) => x !== v)
          : [...prev.varianter, v],
      };
    });
  }

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-72 p-6 border-b-2 md:border-b-0 md:border-r-2 border-yellow-300 flex flex-col gap-5">
        <h2 className="text-2xl font-black text-gray-700">Innstillinger</h2>

        <div>
          <p className="font-bold text-gray-600 mb-2">Tabeller</p>
          <div className="grid grid-cols-5 gap-2">
            {TABELL_VALG.map((t) => (
              <button
                key={t}
                onClick={() => toggleTabell(t)}
                className={`py-2 rounded-xl font-bold border-2 transition-colors ${
                  innstillinger.tabeller.includes(t)
                    ? "bg-purple-400 border-purple-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:border-purple-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-bold text-gray-600 mb-2">Varianter</p>
          <div className="flex flex-col gap-2">
            {ALLE_VARIANTER.map((v) => (
              <label
                key={v}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={innstillinger.varianter.includes(v)}
                  onChange={() => toggleVariant(v)}
                  className="w-5 h-5"
                />
                {VARIANT_LABEL[v]}
              </label>
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

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => setVisGangetabell((vis) => !vis)}
            className="bg-white hover:bg-yellow-50 text-purple-700 text-lg font-black px-6 py-3 rounded-2xl border-2 border-purple-300 transition-colors shadow"
          >
            {visGangetabell ? "Skjul gangetabell" : "Vis gangetabell"}
          </button>
          <button
            onClick={generer}
            disabled={innstillinger.tabeller.length === 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 disabled:border-gray-400 transition-colors shadow"
          >
            Generer! 🎲
          </button>
          <button
            onClick={() => setLynRunde(true)}
            disabled={innstillinger.tabeller.length === 0}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-lg font-black px-6 py-3 rounded-2xl border-2 border-orange-700 disabled:border-gray-400 transition-colors shadow"
          >
            ⚡ Lyn-runde 60s
          </button>
        </div>
      </aside>

      <section className="flex-1 p-6 overflow-y-auto flex gap-8 flex-wrap">
        <div className="flex-1 min-w-72">
          {oppgaver.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <p className="text-6xl">✖️</p>
              <p className="text-xl font-bold">
                Velg tabeller og varianter, trykk Generer!
              </p>
            </div>
          ) : (
            <GangeOppgaveListe
              key={rundeId}
              oppgaver={oppgaver}
              leggTilPoeng={leggTilPoeng}
              onNyRunde={generer}
            />
          )}
        </div>
        {visGangetabell && <Gangetabell />}
      </section>
    </div>
  );
}

function GangeOppgaveListe({
  oppgaver,
  leggTilPoeng,
  onNyRunde,
}: {
  oppgaver: GangeOppgave[];
  leggTilPoeng: (p: number) => void;
  onNyRunde: () => void;
}) {
  const { svar, sjekket, alleSjekket, oppdaterSvar, prøvMarkerSjekket } =
    useOppgaverunde(oppgaver.length, () => ({
      tekst: "",
      valgtSant: null as boolean | null,
    }));
  const { streak, håndterEtt } = useSvarOrkestrering(leggTilPoeng);

  function håndterSvar(i: number, erRett: boolean) {
    if (!prøvMarkerSjekket(i)) return;
    const o = oppgaver[i];
    const [min, max] = o.a <= o.b ? [o.a, o.b] : [o.b, o.a];
    håndterEtt({
      erRett,
      nøkkel: `${min}×${max}`,
      poengVedRett: poengForGangeOppgave(o),
    });
  }

  function sjekkInput(i: number) {
    if (svar[i].tekst === "") return;
    håndterSvar(i, Number(svar[i].tekst) === fasitFor(oppgaver[i]));
  }

  function velgSant(i: number, sant: boolean) {
    const oppgave = oppgaver[i];
    if (oppgave.variant !== "sant-usant") return;
    oppdaterSvar(i, (forrige) => ({ ...forrige, valgtSant: sant }));
    håndterSvar(i, sant === oppgave.påstandRiktig);
  }

  const antallRiktige = oppgaver.filter((o, i) => {
    if (!sjekket[i]) return false;
    if (o.variant === "sant-usant") return svar[i].valgtSant === o.påstandRiktig;
    return Number(svar[i].tekst) === fasitFor(o);
  }).length;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Streakvisning streak={streak} />

      {oppgaver.map((o, i) => (
        <GangeRad
          key={i}
          index={i}
          oppgave={o}
          svar={svar[i].tekst}
          valgtSant={svar[i].valgtSant}
          sjekket={sjekket[i]}
          onSvarEndret={(tekst) =>
            oppdaterSvar(i, (forrige) => ({ ...forrige, tekst }))
          }
          onSjekk={() => sjekkInput(i)}
          onVelgSant={(sant) => velgSant(i, sant)}
          autoFocus={i === 0}
        />
      ))}

      <RundeResultat
        ferdig={alleSjekket}
        antallRiktige={antallRiktige}
        antallOppgaver={oppgaver.length}
        onNyRunde={onNyRunde}
      />
    </div>
  );
}

function GangeRad({
  index,
  oppgave,
  svar,
  valgtSant,
  sjekket,
  autoFocus,
  onSvarEndret,
  onSjekk,
  onVelgSant,
}: {
  index: number;
  oppgave: GangeOppgave;
  svar: string;
  valgtSant: boolean | null;
  sjekket: boolean;
  autoFocus: boolean;
  onSvarEndret: (v: string) => void;
  onSjekk: () => void;
  onVelgSant: (sant: boolean) => void;
}) {
  const erRiktig = sjekket
    ? oppgave.variant === "sant-usant"
      ? valgtSant === oppgave.påstandRiktig
      : Number(svar) === fasitFor(oppgave)
    : null;

  const ramme =
    erRiktig === true
      ? "border-green-400 bg-green-50"
      : erRiktig === false
      ? "border-red-300 bg-red-50"
      : "border-yellow-200 bg-white";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 flex-wrap ${ramme}`}>
      <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
        {index + 1}.
      </span>
      <GangeInnhold
        oppgave={oppgave}
        svar={svar}
        valgtSant={valgtSant}
        sjekket={sjekket}
        erRiktig={erRiktig}
        autoFocus={autoFocus}
        onSvarEndret={onSvarEndret}
        onSjekk={onSjekk}
        onVelgSant={onVelgSant}
      />
      {erRiktig === true && <span className="text-2xl shrink-0">✅</span>}
      {erRiktig === false && <span className="text-2xl shrink-0">❌</span>}
    </div>
  );
}

interface InnholdProps {
  oppgave: GangeOppgave;
  svar: string;
  valgtSant: boolean | null;
  sjekket: boolean;
  erRiktig: boolean | null;
  autoFocus: boolean;
  onSvarEndret: (v: string) => void;
  onSjekk: () => void;
  onVelgSant: (sant: boolean) => void;
}

function GangeInnhold({
  oppgave,
  svar,
  valgtSant,
  sjekket,
  erRiktig,
  autoFocus,
  onSvarEndret,
  onSjekk,
  onVelgSant,
}: InnholdProps) {
  if (oppgave.variant === "sant-usant") {
    return (
      <SantUsantInnhold
        oppgave={oppgave}
        valgtSant={valgtSant}
        sjekket={sjekket}
        onVelgSant={onVelgSant}
      />
    );
  }
  return (
    <InputInnhold
      oppgave={oppgave}
      svar={svar}
      sjekket={sjekket}
      erRiktig={erRiktig}
      autoFocus={autoFocus}
      onSvarEndret={onSvarEndret}
      onSjekk={onSjekk}
    />
  );
}

function SantUsantInnhold({
  oppgave,
  valgtSant,
  sjekket,
  onVelgSant,
}: {
  oppgave: SantUsantOppgave;
  valgtSant: boolean | null;
  sjekket: boolean;
  onVelgSant: (s: boolean) => void;
}) {
  return (
    <>
      <span className="text-2xl font-bold text-purple-500">{oppgave.a}</span>
      <span className="text-2xl font-bold text-gray-500">×</span>
      <span className="text-2xl font-bold text-green-500">{oppgave.b}</span>
      <span className="text-2xl font-bold text-gray-500">=</span>
      <span className="text-2xl font-bold text-orange-500">{oppgave.påstand}</span>
      <SantUsantKnapp
        sant
        valgt={valgtSant === true}
        sjekket={sjekket}
        riktig={oppgave.påstandRiktig}
        onClick={() => onVelgSant(true)}
      />
      <SantUsantKnapp
        sant={false}
        valgt={valgtSant === false}
        sjekket={sjekket}
        riktig={oppgave.påstandRiktig}
        onClick={() => onVelgSant(false)}
      />
    </>
  );
}

function SantUsantKnapp({
  sant,
  valgt,
  sjekket,
  riktig,
  onClick,
}: {
  sant: boolean;
  valgt: boolean;
  sjekket: boolean;
  riktig: boolean;
  onClick: () => void;
}) {
  const erFasit = sjekket && riktig === sant;
  const erFeilValg = sjekket && valgt && !erFasit;
  let stil = "border-blue-300 bg-white hover:border-blue-500 text-gray-700";
  if (sjekket) {
    if (erFasit) stil = "border-green-500 bg-green-100 text-green-800";
    else if (erFeilValg) stil = "border-red-400 bg-red-100 text-red-800";
    else stil = "border-gray-200 bg-gray-50 text-gray-400";
  }
  return (
    <button
      onClick={onClick}
      disabled={sjekket}
      className={`px-4 py-1.5 rounded-xl font-bold border-2 transition-colors ${stil}`}
    >
      {sant ? "Riktig ✓" : "Feil ✗"}
    </button>
  );
}

function InputInnhold({
  oppgave,
  svar,
  sjekket,
  erRiktig,
  autoFocus,
  onSvarEndret,
  onSjekk,
}: {
  oppgave: GangeInputOppgave;
  svar: string;
  sjekket: boolean;
  erRiktig: boolean | null;
  autoFocus: boolean;
  onSvarEndret: (v: string) => void;
  onSjekk: () => void;
}) {
  const inputElement = (
    <input
      type="number"
      value={svar}
      onChange={(e) => onSvarEndret(e.target.value)}
      onBlur={onSjekk}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSjekk();
      }}
      disabled={sjekket}
      autoFocus={autoFocus}
      className={`w-24 text-center text-2xl font-bold border-2 rounded-xl py-1 focus:outline-none ${
        erRiktig === true
          ? "border-green-400 bg-green-50"
          : erRiktig === false
          ? "border-red-400 bg-red-50"
          : "border-blue-300 focus:border-blue-500 bg-white"
      }`}
      placeholder="?"
    />
  );

  if (oppgave.variant === "klassisk") {
    return (
      <>
        <span className="text-2xl font-bold text-purple-500">{oppgave.a}</span>
        <span className="text-2xl font-bold text-gray-500">×</span>
        <span className="text-2xl font-bold text-green-500">{oppgave.b}</span>
        <span className="text-2xl font-bold text-gray-500">=</span>
        {inputElement}
      </>
    );
  }
  if (oppgave.variant === "omvendt") {
    return (
      <>
        <span className="text-2xl font-bold text-purple-500">{oppgave.produkt}</span>
        <span className="text-2xl font-bold text-gray-500">÷</span>
        <span className="text-2xl font-bold text-green-500">{oppgave.b}</span>
        <span className="text-2xl font-bold text-gray-500">=</span>
        {inputElement}
      </>
    );
  }
  // manglende-faktor
  if (oppgave.manglerSide === "a") {
    return (
      <>
        {inputElement}
        <span className="text-2xl font-bold text-gray-500">×</span>
        <span className="text-2xl font-bold text-green-500">{oppgave.b}</span>
        <span className="text-2xl font-bold text-gray-500">=</span>
        <span className="text-2xl font-bold text-orange-500">{oppgave.produkt}</span>
      </>
    );
  }
  return (
    <>
      <span className="text-2xl font-bold text-purple-500">{oppgave.a}</span>
      <span className="text-2xl font-bold text-gray-500">×</span>
      {inputElement}
      <span className="text-2xl font-bold text-gray-500">=</span>
      <span className="text-2xl font-bold text-orange-500">{oppgave.produkt}</span>
    </>
  );
}
