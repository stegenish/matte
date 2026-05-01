// Streak-tilstandsmaskin for én runde av oppgaver.
// Skjoldet beskytter streak'en mot første feil etter at man har bygget den opp.

export const STREAK_GRENSE = 3; // antall rette på rad før streak teller
export const STREAK_BONUS_PER_RETT = 1; // ekstra poeng per rett etter grensen

export interface StreakTilstand {
  riktigPåRad: number;
  skjoldIntakt: boolean;
}

export function nyStreak(): StreakTilstand {
  return { riktigPåRad: 0, skjoldIntakt: true };
}

export interface RettResultat {
  nyTilstand: StreakTilstand;
  streakBonus: number;
}

export function etterRett(tilstand: StreakTilstand): RettResultat {
  const nyttRiktig = tilstand.riktigPåRad + 1;
  const streakBonus = nyttRiktig > STREAK_GRENSE ? STREAK_BONUS_PER_RETT : 0;
  return {
    nyTilstand: { ...tilstand, riktigPåRad: nyttRiktig },
    streakBonus,
  };
}

export interface FeilResultat {
  nyTilstand: StreakTilstand;
  skjoldAbsorberte: boolean;
  streakBrutt: boolean;
}

export function etterFeil(tilstand: StreakTilstand): FeilResultat {
  // Skjoldet beskytter bare når du faktisk har en streak å beskytte
  if (tilstand.riktigPåRad >= STREAK_GRENSE && tilstand.skjoldIntakt) {
    return {
      nyTilstand: { ...tilstand, skjoldIntakt: false },
      skjoldAbsorberte: true,
      streakBrutt: false,
    };
  }
  return {
    nyTilstand: { riktigPåRad: 0, skjoldIntakt: tilstand.skjoldIntakt },
    skjoldAbsorberte: false,
    streakBrutt: tilstand.riktigPåRad >= STREAK_GRENSE,
  };
}
