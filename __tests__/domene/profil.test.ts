import {
  fyllInnDefaults,
  lagNyProfil,
  PROFIL_SCHEMA_VERSJON,
  STANDARD_AVATARER,
} from "@/src/domene/profil";

describe("lagNyProfil", () => {
  it("setter alle felter til standard verdier", () => {
    const p = lagNyProfil("Lily", "🦊");
    expect(p.navn).toBe("Lily");
    expect(p.avatar).toBe("🦊");
    expect(p.poeng).toBe(0);
    expect(p.tittelIndex).toBe(0);
    expect(p.tårnEtasje).toBe(0);
    expect(p.tilbehør).toEqual([]);
    expect(p.faktaStatus).toEqual([]);
    expect(p.funFactsSamlet).toEqual([]);
    expect(p.lydAv).toBe(false);
    expect(p.dagligUtfordringSistGjort).toBeNull();
    expect(p.sistInnstillinger).toBeNull();
    expect(p.statistikk).toEqual({
      totaltRiktige: 0,
      totaltFeil: 0,
      høyesteStreak: 0,
      øvingstyperBrukt: [],
    });
    expect(p.schemaVersjon).toBe(PROFIL_SCHEMA_VERSJON);
  });

  it("genererer unik id per profil", () => {
    const a = lagNyProfil("A", "🦊");
    const b = lagNyProfil("B", "🐢");
    expect(a.id).not.toBe(b.id);
    expect(a.id.length).toBeGreaterThan(0);
  });
});

describe("fyllInnDefaults", () => {
  it("returnerer null for ikke-objekt eller manglende id/navn", () => {
    expect(fyllInnDefaults(null)).toBeNull();
    expect(fyllInnDefaults("ikke et objekt")).toBeNull();
    expect(fyllInnDefaults({})).toBeNull();
    expect(fyllInnDefaults({ id: "x" })).toBeNull();
    expect(fyllInnDefaults({ navn: "Lily" })).toBeNull();
  });

  it("aksepterer minimalt gyldig objekt og fyller inn defaults", () => {
    const p = fyllInnDefaults({ id: "abc", navn: "Lily" });
    expect(p).not.toBeNull();
    expect(p?.poeng).toBe(0);
    expect(p?.tittelIndex).toBe(0);
    expect(p?.avatar).toBe(STANDARD_AVATARER[0]);
    expect(p?.statistikk.totaltRiktige).toBe(0);
  });

  it("beholder eksisterende felter ved migrering", () => {
    const p = fyllInnDefaults({
      id: "abc",
      navn: "Lily",
      avatar: "🦄",
      poeng: 42,
      tittelIndex: 3,
    });
    expect(p?.poeng).toBe(42);
    expect(p?.tittelIndex).toBe(3);
    expect(p?.avatar).toBe("🦄");
  });

  it("fyller inn delvis statistikk-objekt", () => {
    const p = fyllInnDefaults({
      id: "abc",
      navn: "Lily",
      statistikk: { totaltRiktige: 10 },
    });
    expect(p?.statistikk.totaltRiktige).toBe(10);
    expect(p?.statistikk.totaltFeil).toBe(0);
    expect(p?.statistikk.høyesteStreak).toBe(0);
  });
});
