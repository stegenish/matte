"use client";

import { useEffect, useRef, useState } from "react";
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
  // Nullstill streaken (kalles automatisk når oppgaver-referansen endres)
  nullstill: () => void;
}

// Felles strikk- og poeng-orkestrering for alle oppgavetyper.
// Bruker ref for streak for å unngå stale closure ved synkron batch-håndtering.
export function useSvarOrkestrering(
  leggTilPoeng: (p: number) => void,
  oppgaverRef: unknown,
): SvarOrkestrering {
  const [streak, setStreak] = useState<StreakTilstand>(nyStreak);
  const streakRef = useRef<StreakTilstand>(streak);
  const { registrerSvar } = useProfil();

  // Hold streakRef synkronisert med React-state
  streakRef.current = streak;

  // Reset når oppgaver-referansen endres (ny runde)
  useEffect(() => {
    const fersk = nyStreak();
    streakRef.current = fersk;
    setStreak(fersk);
  }, [oppgaverRef]);

  function anvendEtt(info: SvarInfo): StreakTilstand {
    registrerSvar(info.nøkkel, info.erRett);
    if (info.erRett) {
      const r = etterRett(streakRef.current);
      leggTilPoeng(info.poengVedRett + r.streakBonus);
      return r.nyTilstand;
    }
    return etterFeil(streakRef.current).nyTilstand;
  }

  function håndterEtt(info: SvarInfo) {
    const ny = anvendEtt(info);
    streakRef.current = ny;
    setStreak(ny);
  }

  function håndterMange(infoer: SvarInfo[]) {
    let tilstand = streakRef.current;
    for (const info of infoer) {
      streakRef.current = tilstand;
      tilstand = anvendEtt(info);
    }
    streakRef.current = tilstand;
    setStreak(tilstand);
  }

  function nullstill() {
    const fersk = nyStreak();
    streakRef.current = fersk;
    setStreak(fersk);
  }

  return { streak, håndterEtt, håndterMange, nullstill };
}
