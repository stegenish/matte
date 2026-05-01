import { fyllInnDefaults, type Profil } from "@/src/domene/profil";

const PROFILER_NØKKEL = "matteapp.profiler.v1";
const AKTIV_PROFIL_NØKKEL = "matteapp.aktivProfilId.v1";

// Tynn fasade rundt persisteringen. API-et er asynkront fra dag 1
// så vi kan bytte fra localStorage til Supabase/API senere uten å endre
// kallsidene drastisk. localStorage-implementasjonen er synkron internt
// men returnerer Promise for konsistent API.
export interface ProfilLager {
  hentAlle(): Promise<Profil[]>;
  hent(id: string): Promise<Profil | undefined>;
  lagre(profil: Profil): Promise<void>;
  slett(id: string): Promise<void>;
  hentAktivId(): Promise<string | null>;
  settAktivId(id: string | null): Promise<void>;
}

class LocalStorageProfilLager implements ProfilLager {
  async hentAlle(): Promise<Profil[]> {
    const rå = trygtLes(PROFILER_NØKKEL);
    if (!Array.isArray(rå)) return [];
    return rå
      .map((p) => fyllInnDefaults(p))
      .filter((p): p is Profil => p !== null);
  }

  async hent(id: string): Promise<Profil | undefined> {
    const alle = await this.hentAlle();
    return alle.find((p) => p.id === id);
  }

  async lagre(profil: Profil): Promise<void> {
    const alle = await this.hentAlle();
    const utenGammel = alle.filter((p) => p.id !== profil.id);
    trygtSkriv(PROFILER_NØKKEL, [...utenGammel, profil]);
  }

  async slett(id: string): Promise<void> {
    const alle = (await this.hentAlle()).filter((p) => p.id !== id);
    trygtSkriv(PROFILER_NØKKEL, alle);
    if ((await this.hentAktivId()) === id) await this.settAktivId(null);
  }

  async hentAktivId(): Promise<string | null> {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(AKTIV_PROFIL_NØKKEL);
  }

  async settAktivId(id: string | null): Promise<void> {
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
