import {
  nyStreak,
  etterRett,
  etterFeil,
  STREAK_GRENSE,
} from "@/src/domene/streak";

describe("nyStreak", () => {
  it("starter på 0 rette og med intakt skjold", () => {
    const t = nyStreak();
    expect(t.riktigPåRad).toBe(0);
    expect(t.skjoldIntakt).toBe(true);
  });
});

describe("etterRett", () => {
  it("inkrementerer riktig-teller", () => {
    const { nyTilstand } = etterRett(nyStreak());
    expect(nyTilstand.riktigPåRad).toBe(1);
  });

  it("ingen streakbonus før grensen", () => {
    let tilstand = nyStreak();
    for (let i = 0; i < STREAK_GRENSE; i++) {
      const r = etterRett(tilstand);
      expect(r.streakBonus).toBe(0);
      tilstand = r.nyTilstand;
    }
  });

  it("streakbonus etter grensen", () => {
    let tilstand = nyStreak();
    for (let i = 0; i < STREAK_GRENSE; i++) {
      tilstand = etterRett(tilstand).nyTilstand;
    }
    // Rett nr STREAK_GRENSE+1 gir bonus
    const r = etterRett(tilstand);
    expect(r.streakBonus).toBe(1);
  });
});

describe("etterFeil", () => {
  it("nullstiller riktig-teller når det ikke er noen streak å beskytte", () => {
    const tilstand = etterRett(nyStreak()).nyTilstand;
    const r = etterFeil(tilstand);
    expect(r.nyTilstand.riktigPåRad).toBe(0);
    expect(r.skjoldAbsorberte).toBe(false);
    expect(r.streakBrutt).toBe(false);
  });

  it("skjoldet absorberer første feil etter streak", () => {
    let tilstand = nyStreak();
    for (let i = 0; i < STREAK_GRENSE; i++) {
      tilstand = etterRett(tilstand).nyTilstand;
    }
    const r = etterFeil(tilstand);
    expect(r.skjoldAbsorberte).toBe(true);
    expect(r.streakBrutt).toBe(false);
    expect(r.nyTilstand.riktigPåRad).toBe(STREAK_GRENSE);
    expect(r.nyTilstand.skjoldIntakt).toBe(false);
  });

  it("andre feil etter skjold-absorpsjon brytes streaken", () => {
    let tilstand = nyStreak();
    for (let i = 0; i < STREAK_GRENSE; i++) {
      tilstand = etterRett(tilstand).nyTilstand;
    }
    tilstand = etterFeil(tilstand).nyTilstand;
    const r = etterFeil(tilstand);
    expect(r.streakBrutt).toBe(true);
    expect(r.nyTilstand.riktigPåRad).toBe(0);
  });

  it("skjold er kun aktivt når man har en faktisk streak", () => {
    // 1 rett, så feil — skjoldet beskytter ikke fordi streak < grense
    const tilstand = etterRett(nyStreak()).nyTilstand;
    const r = etterFeil(tilstand);
    expect(r.skjoldAbsorberte).toBe(false);
    expect(r.nyTilstand.riktigPåRad).toBe(0);
  });
});
