import {
  fyllInnDefaults,
  giPoeng,
  lagNyProfil,
  migrerProfilData,
  PROFIL_SCHEMA_VERSJON,
  STANDARD_AVATARER,
} from "@/src/domene/profil";

describe("lagNyProfil", () => {
  it("setter alle felter til standard verdier", () => {
    const p = lagNyProfil("Lily", "🦊");
    expect(p.navn).toBe("Lily");
    expect(p.avatar).toBe("🦊");
    expect(p.poeng).toBe(0);
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

describe("giPoeng", () => {
  it("oppdaterer poeng uten å lagre avledet progresjon", () => {
    const profil = giPoeng(lagNyProfil("Lily", "🦊"), 500);

    expect(profil.poeng).toBe(500);
    expect("tittelIndex" in profil).toBe(false);
    expect("tårnEtasje" in profil).toBe(false);
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
    expect(p?.avatar).toBe(STANDARD_AVATARER[0]);
    expect(p?.statistikk.totaltRiktige).toBe(0);
  });

  it("beholder eksisterende felter ved migrering", () => {
    const p = fyllInnDefaults({
      id: "abc",
      navn: "Lily",
      avatar: "🦄",
      poeng: 42,
    });
    expect(p?.poeng).toBe(42);
    expect(p?.avatar).toBe("🦄");
  });

  it("ignorerer gammel avledet progresjon ved lasting", () => {
    const p = fyllInnDefaults({
      id: "abc",
      navn: "Lily",
      poeng: 500,
      tittelIndex: 0,
      tårnEtasje: 0,
    });
    expect(p && "tittelIndex" in p).toBe(false);
    expect(p && "tårnEtasje" in p).toBe(false);
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

describe("migrerProfilData", () => {
  it("returnerer dataen uendret når schemaVersjon matcher gjeldende", () => {
    const data = { id: "x", navn: "Lily", schemaVersjon: PROFIL_SCHEMA_VERSJON };
    const migrert = migrerProfilData(data);
    expect((migrert as { schemaVersjon: number }).schemaVersjon).toBe(PROFIL_SCHEMA_VERSJON);
  });

  it("antar versjon 1 når schemaVersjon mangler", () => {
    const data = { id: "x", navn: "Lily" };
    const migrert = migrerProfilData(data) as { schemaVersjon: number };
    // Med PROFIL_SCHEMA_VERSJON = 1 og ingen migrasjoner registrert ender vi opp på versjon 1
    expect(migrert.schemaVersjon).toBe(1);
  });

  it("returnerer ikke-objekter uendret", () => {
    expect(migrerProfilData(null)).toBeNull();
    expect(migrerProfilData("foo")).toBe("foo");
    expect(migrerProfilData(undefined)).toBeUndefined();
  });
});
