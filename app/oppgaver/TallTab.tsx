"use client";

import { useState } from "react";
import {
  POENG_PER_TALL_OPPGAVE,
  TALL_PAKKER,
  type TallOppgave,
  type TallPakke,
  type LeseTallOppgave,
  type SkriveTallOppgave,
} from "@/src/domene/tallpakker";
import { tallTilNavn } from "@/src/domene/tallNavn";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import { useSvarOrkestrering } from "@/src/komponenter/useSvarOrkestrering";
import {
  useGenerertRunde,
  useOppgaverunde,
} from "@/src/komponenter/useOppgaverunde";
import { RundeResultat } from "@/src/komponenter/RundeResultat";

interface Props {
  leggTilPoeng: (p: number) => void;
}

export function TallTab({ leggTilPoeng }: Props) {
  const [valgtPakke, setValgtPakke] = useState<TallPakke | null>(null);
  const { runde, startRunde } = useGenerertRunde<TallOppgave>();
  const { id: rundeId, oppgaver } = runde;

  function velgPakke(pakke: TallPakke) {
    setValgtPakke(pakke);
    startRunde(pakke.generer());
  }

  function nyRunde() {
    if (valgtPakke) startRunde(valgtPakke.generer());
  }

  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <div className="flex flex-col gap-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-black text-gray-700 mb-3">Velg en pakke</h2>
          <div className="flex flex-wrap gap-3">
            {TALL_PAKKER.map((p) => (
              <button
                key={p.id}
                onClick={() => velgPakke(p)}
                className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-4 transition-colors w-56 text-left ${
                  valgtPakke?.id === p.id
                    ? "border-green-500 bg-green-50"
                    : "border-yellow-300 bg-white hover:border-green-400"
                }`}
              >
                <span className="text-lg font-black text-purple-600">{p.navn}</span>
                <span className="text-sm text-gray-600">{p.beskrivelse}</span>
              </button>
            ))}
          </div>
        </div>

        {valgtPakke && oppgaver.length > 0 && (
          <div className="border-t-2 border-yellow-200 pt-4">
            <h3 className="text-lg font-black text-purple-600 mb-3">
              {valgtPakke.navn}
            </h3>
            <TallOppgaveListe
              key={rundeId}
              oppgaver={oppgaver}
              leggTilPoeng={leggTilPoeng}
              onNyRunde={nyRunde}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function TallOppgaveListe({
  oppgaver,
  leggTilPoeng,
  onNyRunde,
}: {
  oppgaver: TallOppgave[];
  leggTilPoeng: (p: number) => void;
  onNyRunde: () => void;
}) {
  const { svar, sjekket, alleSjekket, oppdaterSvar, prøvMarkerSjekket } =
    useOppgaverunde(oppgaver.length, () => ({
      valgt: null as number | null,
      tekst: "",
    }));
  const { streak, håndterEtt } = useSvarOrkestrering(leggTilPoeng);

  function håndterSvar(i: number, erRett: boolean) {
    if (!prøvMarkerSjekket(i)) return;
    håndterEtt({
      erRett,
      nøkkel: `tall:${oppgaver[i].tall}`,
      poengVedRett: POENG_PER_TALL_OPPGAVE,
    });
  }

  function velgAlternativ(i: number, tall: number) {
    oppdaterSvar(i, (forrige) => ({ ...forrige, valgt: tall }));
    håndterSvar(i, tall === oppgaver[i].tall);
  }

  function sjekkSkrive(i: number) {
    if (svar[i].tekst === "") return;
    håndterSvar(i, Number(svar[i].tekst) === oppgaver[i].tall);
  }

  const antallRiktige = oppgaver.filter((o, i) => {
    if (!sjekket[i]) return false;
    return o.modus === "lese"
      ? svar[i].valgt === o.tall
      : Number(svar[i].tekst) === o.tall;
  }).length;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Streakvisning streak={streak} />

      {oppgaver.map((o, i) => {
        const erRiktig = sjekket[i]
          ? o.modus === "lese"
            ? svar[i].valgt === o.tall
            : Number(svar[i].tekst) === o.tall
          : null;
        return o.modus === "lese" ? (
          <LeseTallRad
            key={i}
            index={i}
            oppgave={o}
            valgt={svar[i].valgt}
            sjekket={sjekket[i]}
            erRiktig={erRiktig}
            onVelg={(tall) => velgAlternativ(i, tall)}
          />
        ) : (
          <SkriveTallRad
            key={i}
            index={i}
            oppgave={o}
            svar={svar[i].tekst}
            sjekket={sjekket[i]}
            erRiktig={erRiktig}
            onSvarEndret={(tekst) =>
              oppdaterSvar(i, (forrige) => ({ ...forrige, tekst }))
            }
            onSjekk={() => sjekkSkrive(i)}
          />
        );
      })}

      <RundeResultat
        ferdig={alleSjekket}
        antallRiktige={antallRiktige}
        antallOppgaver={oppgaver.length}
        onNyRunde={onNyRunde}
      />
    </div>
  );
}

function LeseTallRad({
  index,
  oppgave,
  valgt,
  sjekket,
  erRiktig,
  onVelg,
}: {
  index: number;
  oppgave: LeseTallOppgave;
  valgt: number | null;
  sjekket: boolean;
  erRiktig: boolean | null;
  onVelg: (tall: number) => void;
}) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-2xl border-2 ${
        erRiktig === true
          ? "border-green-400 bg-green-50"
          : erRiktig === false
          ? "border-red-300 bg-red-50"
          : "border-yellow-200 bg-white"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
          {index + 1}.
        </span>
        <span className="text-lg font-bold text-gray-600">Hvilket tall er</span>
        <span className="text-4xl font-black text-purple-600">{oppgave.tall}</span>
        <span className="text-lg font-bold text-gray-600">?</span>
        {erRiktig === true && <span className="text-2xl ml-auto">✅</span>}
        {erRiktig === false && <span className="text-2xl ml-auto">❌</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 ml-10">
        {oppgave.alternativer.map((alt) => {
          const erValgt = valgt === alt;
          const erFasit = alt === oppgave.tall;
          let kolonner =
            "border-blue-300 bg-white hover:border-blue-500 text-gray-700";
          if (sjekket) {
            if (erFasit) kolonner = "border-green-500 bg-green-100 text-green-800";
            else if (erValgt) kolonner = "border-red-400 bg-red-100 text-red-800";
            else kolonner = "border-gray-200 bg-white text-gray-400";
          }
          return (
            <button
              key={alt}
              disabled={sjekket}
              onClick={() => onVelg(alt)}
              className={`text-lg font-bold px-4 py-2 rounded-xl border-2 transition-colors ${kolonner}`}
            >
              {tallTilNavn(alt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkriveTallRad({
  index,
  oppgave,
  svar,
  sjekket,
  erRiktig,
  onSvarEndret,
  onSjekk,
}: {
  index: number;
  oppgave: SkriveTallOppgave;
  svar: string;
  sjekket: boolean;
  erRiktig: boolean | null;
  onSvarEndret: (v: string) => void;
  onSjekk: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
        erRiktig === true
          ? "border-green-400 bg-green-50"
          : erRiktig === false
          ? "border-red-300 bg-red-50"
          : "border-yellow-200 bg-white"
      }`}
    >
      <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
        {index + 1}.
      </span>
      <span className="text-2xl font-black text-purple-600 flex-1">
        {oppgave.navn}
      </span>
      <span className="text-2xl font-bold text-gray-500">=</span>
      <input
        type="number"
        value={svar}
        onChange={(e) => onSvarEndret(e.target.value)}
        onBlur={() => onSjekk()}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSjekk();
        }}
        disabled={sjekket}
        autoFocus={index === 0}
        className={`w-24 text-center text-2xl font-bold border-2 rounded-xl py-1 focus:outline-none ${
          erRiktig === true
            ? "border-green-400 bg-green-50"
            : erRiktig === false
            ? "border-red-400 bg-red-50"
            : "border-blue-300 focus:border-blue-500 bg-white"
        }`}
        placeholder="?"
      />
      {erRiktig === true && <span className="text-2xl shrink-0">✅</span>}
      {erRiktig === false && <span className="text-2xl shrink-0">❌</span>}
    </div>
  );
}
