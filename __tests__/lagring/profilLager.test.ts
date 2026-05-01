/**
 * @jest-environment jsdom
 */
import { profilLager } from "@/src/lagring/profilLager";
import { lagNyProfil } from "@/src/domene/profil";

describe("profilLager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returnerer tom liste når ingenting er lagret", async () => {
    expect(await profilLager.hentAlle()).toEqual([]);
  });

  it("lagre + hent gir samme profil", async () => {
    const p = lagNyProfil("Lily", "🦊");
    await profilLager.lagre(p);
    expect(await profilLager.hent(p.id)).toEqual(p);
  });

  it("lagre flere profiler", async () => {
    const a = lagNyProfil("Lily", "🦊");
    const b = lagNyProfil("Lineus", "🐢");
    await profilLager.lagre(a);
    await profilLager.lagre(b);
    const alle = await profilLager.hentAlle();
    expect(alle).toHaveLength(2);
    expect(alle.map((p) => p.navn).sort()).toEqual(["Lily", "Lineus"]);
  });

  it("lagre samme id igjen oppdaterer i stedet for å duplisere", async () => {
    const p = lagNyProfil("Lily", "🦊");
    await profilLager.lagre(p);
    await profilLager.lagre({ ...p, poeng: 100 });
    const alle = await profilLager.hentAlle();
    expect(alle).toHaveLength(1);
    expect(alle[0].poeng).toBe(100);
  });

  it("slett fjerner profil", async () => {
    const p = lagNyProfil("Lily", "🦊");
    await profilLager.lagre(p);
    await profilLager.slett(p.id);
    expect(await profilLager.hent(p.id)).toBeUndefined();
  });

  it("aktiv-id kan settes og hentes", async () => {
    const p = lagNyProfil("Lily", "🦊");
    await profilLager.lagre(p);
    await profilLager.settAktivId(p.id);
    expect(await profilLager.hentAktivId()).toBe(p.id);
  });

  it("slett av aktiv profil nullstiller aktiv-id", async () => {
    const p = lagNyProfil("Lily", "🦊");
    await profilLager.lagre(p);
    await profilLager.settAktivId(p.id);
    await profilLager.slett(p.id);
    expect(await profilLager.hentAktivId()).toBeNull();
  });

  it("ignorerer korrupt JSON i localStorage", async () => {
    localStorage.setItem("matteapp.profiler.v1", "ikke gyldig json");
    expect(await profilLager.hentAlle()).toEqual([]);
  });

  it("ignorerer profiler uten id eller navn", async () => {
    localStorage.setItem(
      "matteapp.profiler.v1",
      JSON.stringify([{ id: "ok", navn: "OK" }, { navn: "Mangler id" }, null]),
    );
    const alle = await profilLager.hentAlle();
    expect(alle).toHaveLength(1);
    expect(alle[0].navn).toBe("OK");
  });
});
