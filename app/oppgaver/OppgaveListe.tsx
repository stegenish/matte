"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Oppgave } from "@/src/domene/typer";
import { poengForOppgave } from "@/src/domene/poeng";
import {
  etterFeil,
  etterRett,
  nyStreak,
  type StreakTilstand,
} from "@/src/domene/streak";
import { oppdaterIndex } from "@/src/domene/arrayhjelper";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import type { VisualiseringsType } from "@/src/domene/mønsterpakker";
import { OppgaveRad } from "./OppgaveRad";

export interface OppgaveListeHandle {
  focusInput: (i: number) => void;
}

interface Props {
  oppgaver: Oppgave[];
  leggTilPoeng: (p: number) => void;
  onNyRunde: () => void;
  onEnterAt?: (i: number) => void;
  visualiseringsType?: VisualiseringsType;
}

const OppgaveListe = forwardRef<OppgaveListeHandle, Props>(function OppgaveListe(
  { oppgaver, leggTilPoeng, onNyRunde, onEnterAt, visualiseringsType },
  ref,
) {
  const [svar, setSvar] = useState<string[]>(() => Array(oppgaver.length).fill(""));
  const [sjekket, setSjekket] = useState<boolean[]>(() => Array(oppgaver.length).fill(false));
  const [streak, setStreak] = useState<StreakTilstand>(nyStreak);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    focusInput: (i: number) => inputRefs.current[i]?.focus(),
  }));

  // Reset state når parent sender nye oppgaver (ny runde)
  useEffect(() => {
    setSvar(Array(oppgaver.length).fill(""));
    setSjekket(Array(oppgaver.length).fill(false));
    setStreak(nyStreak());
  }, [oppgaver]);

  function sjekkEtt(i: number) {
    if (svar[i] === "" || sjekket[i]) return;
    setSjekket((prev) => oppdaterIndex(prev, i, true));
    if (Number(svar[i]) === oppgaver[i].svar) {
      const r = etterRett(streak);
      setStreak(r.nyTilstand);
      leggTilPoeng(poengForOppgave(oppgaver[i]) + r.streakBonus);
    } else {
      setStreak(etterFeil(streak).nyTilstand);
    }
  }

  function sjekkAlle() {
    const nySjekket = oppgaver.map((_, i) => svar[i] !== "");
    setSjekket(nySjekket);
    // Spor streak-tilstand lokalt gjennom løkken så vi ikke leser stale state
    let lokalStreak = streak;
    oppgaver.forEach((o, i) => {
      if (sjekket[i] || !nySjekket[i]) return;
      if (Number(svar[i]) === o.svar) {
        const r = etterRett(lokalStreak);
        lokalStreak = r.nyTilstand;
        leggTilPoeng(poengForOppgave(o) + r.streakBonus);
      } else {
        lokalStreak = etterFeil(lokalStreak).nyTilstand;
      }
    });
    setStreak(lokalStreak);
  }

  function prøvIgjen(i: number) {
    setSvar((prev) => oppdaterIndex(prev, i, ""));
    setSjekket((prev) => oppdaterIndex(prev, i, false));
  }

  function håndterEnter(i: number) {
    sjekkEtt(i);
    if (onEnterAt) onEnterAt(i);
    else inputRefs.current[i + 1]?.focus();
  }

  const alleSjekket =
    oppgaver.length > 0 &&
    sjekket.length === oppgaver.length &&
    sjekket.every(Boolean);
  const antallRiktige = oppgaver.filter(
    (o, i) => sjekket[i] && Number(svar[i]) === o.svar,
  ).length;

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Streakvisning streak={streak} />

      {alleSjekket && (
        <p className="text-2xl font-black text-center text-green-700 mb-2">
          {antallRiktige} / {oppgaver.length} riktige!{" "}
          {antallRiktige === oppgaver.length ? "🎉" : "💪"}
        </p>
      )}

      {oppgaver.map((o, i) => (
        <OppgaveRad
          key={i}
          index={i}
          oppgave={o}
          svar={svar[i]}
          riktig={sjekket[i] ? Number(svar[i]) === o.svar : null}
          inputRef={(el) => {
            inputRefs.current[i] = el;
          }}
          autoFocus={i === 0}
          visualiseringsType={visualiseringsType}
          onSvarEndret={(verdi) => setSvar((prev) => oppdaterIndex(prev, i, verdi))}
          onBlur={() => sjekkEtt(i)}
          onEnter={() => håndterEnter(i)}
          onPrøvIgjen={() => prøvIgjen(i)}
        />
      ))}

      {!alleSjekket && (
        <button
          onClick={sjekkAlle}
          className="mt-2 bg-blue-400 hover:bg-blue-500 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-blue-600 transition-colors self-start shadow"
        >
          Sjekk svar! 🔍
        </button>
      )}
      {alleSjekket && (
        <button
          onClick={onNyRunde}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 transition-colors self-start shadow"
        >
          Ny runde! 🎲
        </button>
      )}
    </div>
  );
});

export default OppgaveListe;
