import {
  ANTALL_DAGLIGE,
  belønnDagligUtfordring,
  harGjortIDag,
  lagDagligUtfordring,
  markerGjortIDag,
  nøkkelTilOppgave,
} from "@/src/domene/dagligUtfordring";
import { lagNyProfil } from "@/src/domene/profil";
import { FUN_FACTS } from "@/src/domene/titler";

describe("nøkkelTilOppgave", () => {
  it("parser pluss", () => {
    expect(nøkkelTilOppgave("3+5")).toEqual({
      a: 3, b: 5, operasjon: "+", svar: 8,
    });
  });

  it("parser minus", () => {
    expect(nøkkelTilOppgave("12-5")).toEqual({
      a: 12, b: 5, operasjon: "-", svar: 7,
    });
  });

  it("parser ganging", () => {
    expect(nøkkelTilOppgave("7×8")).toEqual({
      a: 7, b: 8, operasjon: "×", svar: 56,
    });
  });

  it("parser divisjon", () => {
    expect(nøkkelTilOppgave("56÷7")).toEqual({
      a: 56, b: 7, operasjon: "÷", svar: 8,
    });
  });

  it("returnerer null for tall-nøkler", () => {
    expect(nøkkelTilOppgave("tall:47")).toBeNull();
  });

  it("returnerer null for ukjent format", () => {
    expect(nøkkelTilOppgave("noe rart")).toBeNull();
  });
});

describe("lagDagligUtfordring", () => {
  it("returnerer 5 oppgaver for ny profil (uten fakta)", () => {
    const profil = lagNyProfil("Lily", "🦊");
    const oppgaver = lagDagligUtfordring(profil);
    expect(oppgaver).toHaveLength(ANTALL_DAGLIGE);
  });

  it("prioriterer vanskeligste fakta", () => {
    const profil = lagNyProfil("Lily", "🦊");
    profil.faktaStatus = [
      { oppgaveNøkkel: "7×8", rette: 0, feile: 5, sistVist: "" },
      { oppgaveNøkkel: "3+5", rette: 5, feile: 0, sistVist: "" }, // ingen feil — ekskluderes
      { oppgaveNøkkel: "12-5", rette: 1, feile: 3, sistVist: "" },
    ];
    const oppgaver = lagDagligUtfordring(profil);
    // De 2 første skal være de vanskeligste fra fakta
    expect(oppgaver[0]).toMatchObject({ a: 7, b: 8, operasjon: "×" });
    expect(oppgaver[1]).toMatchObject({ a: 12, b: 5, operasjon: "-" });
    // Resten fylles med pluss-oppgaver
    expect(oppgaver).toHaveLength(ANTALL_DAGLIGE);
  });
});

describe("harGjortIDag / markerGjortIDag", () => {
  it("ny profil har ikke gjort daglig", () => {
    expect(harGjortIDag(lagNyProfil("Lily", "🦊"))).toBe(false);
  });

  it("etter markerGjortIDag returnerer harGjortIDag true", () => {
    const profil = lagNyProfil("Lily", "🦊");
    const oppdatert = markerGjortIDag(profil);
    expect(harGjortIDag(oppdatert)).toBe(true);
  });

  it("dato fra i går regnes ikke som i dag", () => {
    const profil = lagNyProfil("Lily", "🦊");
    profil.dagligUtfordringSistGjort = "2020-01-01";
    expect(harGjortIDag(profil)).toBe(false);
  });

  it("gir daglig bonus bare én gang samme dag", () => {
    const dato = new Date("2026-09-09T12:00:00Z");
    const profil = lagNyProfil("Lily", "🦊");

    const første = belønnDagligUtfordring(profil, dato);
    const andre = belønnDagligUtfordring(første.profil, dato);

    expect(første.bonusGitt).toBe(true);
    expect(andre.bonusGitt).toBe(false);
    expect(andre.profil.poeng).toBe(første.profil.poeng);
  });

  it("velger første us samlede fun fact uten duplikater", () => {
    const profil = lagNyProfil("Lily", "🦊");
    profil.funFactsSamlet = [FUN_FACTS[1]];

    const resultat = belønnDagligUtfordring(
      profil,
      new Date("2026-09-09T12:00:00Z"),
    );

    expect(resultat.nyFunFact).toBe(FUN_FACTS[0]);
    expect(new Set(resultat.profil.funFactsSamlet).size).toBe(2);
  });
});
