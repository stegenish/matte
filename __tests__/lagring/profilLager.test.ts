/**
 * @jest-environment jsdom
 */
import { profilLager } from "@/src/lagring/profilLager";
import { lagNyProfil } from "@/src/domene/profil";

describe("profilLager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returnerer tom liste når ingenting er lagret", () => {
    expect(profilLager.hentAlle()).toEqual([]);
  });

  it("lagre + hent gir samme profil", () => {
    const p = lagNyProfil("Lily", "🦊");
    profilLager.lagre(p);
    expect(profilLager.hent(p.id)).toEqual(p);
  });

  it("lagre flere profiler", () => {
    const a = lagNyProfil("Lily", "🦊");
    const b = lagNyProfil("Lineus", "🐢");
    profilLager.lagre(a);
    profilLager.lagre(b);
    const alle = profilLager.hentAlle();
    expect(alle).toHaveLength(2);
    expect(alle.map((p) => p.navn).sort()).toEqual(["Lily", "Lineus"]);
  });

  it("lagre samme id igjen oppdaterer i stedet for å duplisere", () => {
    const p = lagNyProfil("Lily", "🦊");
    profilLager.lagre(p);
    profilLager.lagre({ ...p, poeng: 100 });
    const alle = profilLager.hentAlle();
    expect(alle).toHaveLength(1);
    expect(alle[0].poeng).toBe(100);
  });

  it("slett fjerner profil", () => {
    const p = lagNyProfil("Lily", "🦊");
    profilLager.lagre(p);
    profilLager.slett(p.id);
    expect(profilLager.hent(p.id)).toBeUndefined();
  });

  it("aktiv-id kan settes og hentes", () => {
    const p = lagNyProfil("Lily", "🦊");
    profilLager.lagre(p);
    profilLager.settAktivId(p.id);
    expect(profilLager.hentAktivId()).toBe(p.id);
  });

  it("slett av aktiv profil nullstiller aktiv-id", () => {
    const p = lagNyProfil("Lily", "🦊");
    profilLager.lagre(p);
    profilLager.settAktivId(p.id);
    profilLager.slett(p.id);
    expect(profilLager.hentAktivId()).toBeNull();
  });

  it("ignorerer korrupt JSON i localStorage", () => {
    localStorage.setItem("matteapp.profiler.v1", "ikke gyldig json");
    expect(profilLager.hentAlle()).toEqual([]);
  });

  it("ignorerer profiler uten id eller navn", () => {
    localStorage.setItem(
      "matteapp.profiler.v1",
      JSON.stringify([{ id: "ok", navn: "OK" }, { navn: "Mangler id" }, null]),
    );
    const alle = profilLager.hentAlle();
    expect(alle).toHaveLength(1);
    expect(alle[0].navn).toBe("OK");
  });
});
