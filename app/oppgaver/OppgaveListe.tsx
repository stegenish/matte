"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Oppgave } from "@/src/domene/typer";
import { poengForOppgave } from "@/src/domene/poeng";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import { useSvarOrkestrering } from "@/src/komponenter/useSvarOrkestrering";
import { useOppgaverunde } from "@/src/komponenter/useOppgaverunde";
import { RundeResultat } from "@/src/komponenter/RundeResultat";
import { nøkkelForOppgave } from "@/src/domene/faktaStatus";
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
  // Kalles én gang når alle oppgavene er sjekket
  onFerdig?: () => void;
}

const OppgaveListe = forwardRef<OppgaveListeHandle, Props>(function OppgaveListe(
  { oppgaver, leggTilPoeng, onNyRunde, onEnterAt, visualiseringsType, onFerdig },
  ref,
) {
  const {
    svar,
    sjekket,
    alleSjekket,
    oppdaterSvar,
    prøvMarkerSjekket,
    markerSjekketMange,
    prøvIgjen,
  } = useOppgaverunde(oppgaver.length, () => "");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { streak, håndterEtt, håndterMange } = useSvarOrkestrering(leggTilPoeng);

  useImperativeHandle(ref, () => ({
    focusInput: (i: number) => inputRefs.current[i]?.focus(),
  }));

  function sjekkEtt(i: number) {
    if (svar[i] === "" || !prøvMarkerSjekket(i)) return;
    const o = oppgaver[i];
    const erRett = Number(svar[i]) === o.svar;
    håndterEtt({
      erRett,
      nøkkel: nøkkelForOppgave(o),
      poengVedRett: poengForOppgave(o),
    });
  }

  function sjekkAlle() {
    const nye = markerSjekketMange(
      oppgaver.flatMap((_, i) => (svar[i] === "" ? [] : [i])),
    );
    håndterMange(
      nye.map((i) => {
        const o = oppgaver[i];
        return {
          erRett: Number(svar[i]) === o.svar,
          nøkkel: nøkkelForOppgave(o),
          poengVedRett: poengForOppgave(o),
        };
      }),
    );
  }

  function håndterEnter(i: number) {
    sjekkEtt(i);
    if (onEnterAt) onEnterAt(i);
    else inputRefs.current[i + 1]?.focus();
  }

  const antallRiktige = oppgaver.filter(
    (o, i) => sjekket[i] && Number(svar[i]) === o.svar,
  ).length;

  useEffect(() => {
    if (alleSjekket && onFerdig) onFerdig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alleSjekket]);

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Streakvisning streak={streak} />

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
          onSvarEndret={(verdi) => oppdaterSvar(i, verdi)}
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
      <RundeResultat
        ferdig={alleSjekket}
        antallRiktige={antallRiktige}
        antallOppgaver={oppgaver.length}
        onNyRunde={onNyRunde}
      />
    </div>
  );
});

export default OppgaveListe;
