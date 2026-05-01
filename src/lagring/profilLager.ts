import { fyllInnDefaults, type Profil } from "@/src/domene/profil";

const PROFILER_NØKKEL = "matteapp.profiler.v1";
const AKTIV_PROFIL_NØKKEL = "matteapp.aktivProfilId.v1";

// Tynn fasade rundt localStorage. Designet for å kunne erstattes med
// en API-klient senere uten endringer i kallsidene.
export interface ProfilLager {
  hentAlle(): Profil[];
  hent(id: string): Profil | undefined;
  lagre(profil: Profil): void;
  slett(id: string): void;
  hentAktivId(): string | null;
  settAktivId(id: string | null): void;
}

class LocalStorageProfilLager implements ProfilLager {
  hentAlle(): Profil[] {
    const rå = trygtLes(PROFILER_NØKKEL);
    if (!Array.isArray(rå)) return [];
    return rå
      .map((p) => fyllInnDefaults(p))
      .filter((p): p is Profil => p !== null);
  }

  hent(id: string): Profil | undefined {
    return this.hentAlle().find((p) => p.id === id);
  }

  lagre(profil: Profil): void {
    const alle = this.hentAlle();
    const utenGammel = alle.filter((p) => p.id !== profil.id);
    trygtSkriv(PROFILER_NØKKEL, [...utenGammel, profil]);
  }

  slett(id: string): void {
    const alle = this.hentAlle().filter((p) => p.id !== id);
    trygtSkriv(PROFILER_NØKKEL, alle);
    if (this.hentAktivId() === id) this.settAktivId(null);
  }

  hentAktivId(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(AKTIV_PROFIL_NØKKEL);
  }

  settAktivId(id: string | null): void {
    if (typeof localStorage === "undefined") return;
    if (id === null) localStorage.removeItem(AKTIV_PROFIL_NØKKEL);
    else localStorage.setItem(AKTIV_PROFIL_NØKKEL, id);
  }
}

function trygtLes(nøkkel: string): unknown {
  if (typeof localStorage === "undefined") return null;
  const tekst = localStorage.getItem(nøkkel);
  if (tekst === null) return null;
  try {
    return JSON.parse(tekst);
  } catch {
    return null;
  }
}

function trygtSkriv(nøkkel: string, verdi: unknown): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(nøkkel, JSON.stringify(verdi));
}

export const profilLager: ProfilLager = new LocalStorageProfilLager();
