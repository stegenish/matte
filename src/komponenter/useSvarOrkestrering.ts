"use client";

import { useState } from "react";
import {
  etterFeil,
  etterRett,
  nyStreak,
  type StreakTilstand,
} from "@/src/domene/streak";
import { useProfil } from "./ProfilProvider";

export interface SvarInfo {
  erRett: boolean;
  // Nøkkel for faktaStatus-tracking; null = ikke spor (f.eks. tall-oppgaver
  // som ikke har en stabil "fakta"-form)
  nøkkel: string | null;
  // Antall poeng som gis hvis svaret er riktig (uten streak-bonus)
  poengVedRett: number;
}

export interface SvarOrkestrering {
  streak: StreakTilstand;
  // Registrer ett svar (sjekkEtt-stil)
  håndterEtt: (info: SvarInfo) => void;
  // Registrer flere svar i sekvens (sjekkAlle-stil) — bevarer streak-akkumulering
  // gjennom løkken uten stale-closure-bugs
  håndterMange: (info: SvarInfo[]) => void;
  // Nullstill streaken
  nullstill: () => void;
}

// Felles streak- og poeng-orkestrering for alle oppgavetyper.
//
// Designvalg: side-effekter (registrerSvar, leggTilPoeng) skjer utenfor setState-
// callbacks så de ikke dobles i React Strict Mode. håndterMange bruker en lokal
// variabel for streak-akkumulering gjennom batchet — håndterEtt og håndterMange
// kalles én gang per brukerklikk, så closure-tilstand er ikke stale.
export function useSvarOrkestrering(
  leggTilPoeng: (p: number) => void,
  oppgaverRef: unknown,
): SvarOrkestrering {
  const [streak, setStreak] = useState<StreakTilstand>(nyStreak);
  const { registrerSvar } = useProfil();

  // Reset streak når oppgaver-referansen endres (ny runde) — React 19-mønsteret
  // for å reagere på prop-endringer uten cascading useEffect-renders.
  const [sistOppgaverRef, setSistOppgaverRef] = useState<unknown>(oppgaverRef);
  if (sistOppgaverRef !== oppgaverRef) {
    setStreak(nyStreak());
    setSistOppgaverRef(oppgaverRef);
  }

  function håndterEtt(info: SvarInfo) {
    registrerSvar(info.nøkkel, info.erRett);
    if (info.erRett) {
      const r = etterRett(streak);
      leggTilPoeng(info.poengVedRett + r.streakBonus);
      setStreak(r.nyTilstand);
    } else {
      setStreak(etterFeil(streak).nyTilstand);
    }
  }

  function håndterMange(infoer: SvarInfo[]) {
    let tilstand = streak;
    for (const info of infoer) {
      registrerSvar(info.nøkkel, info.erRett);
      if (info.erRett) {
        const r = etterRett(tilstand);
        leggTilPoeng(info.poengVedRett + r.streakBonus);
        tilstand = r.nyTilstand;
      } else {
        tilstand = etterFeil(tilstand).nyTilstand;
      }
    }
    setStreak(tilstand);
  }

  function nullstill() {
    setStreak(nyStreak());
  }

  return { streak, håndterEtt, håndterMange, nullstill };
}
