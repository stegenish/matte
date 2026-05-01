import type { ProfilLager } from "@/src/lagring/profilLager";
import type { Profil } from "@/src/domene/profil";

// In-memory implementasjon av ProfilLager — for tester uten localStorage.
// Synkron oppførsel innenfor Promise-skall så API-et matcher produksjon.
export interface FakeLager extends ProfilLager {
  // Synkron tilgang for assert-bruk i tester
  snapshot(): { profiler: Profil[]; aktivId: string | null };
  hentSync(id: string): Profil | undefined;
}

export function lagFakeLager(seed: Profil[] = []): FakeLager {
  let profiler: Profil[] = [...seed];
  let aktivId: string | null = null;
  return {
    async hentAlle() {
      return [...profiler];
    },
    async hent(id: string) {
      return profiler.find((p) => p.id === id);
    },
    async lagre(profil: Profil) {
      profiler = profiler.filter((p) => p.id !== profil.id);
      profiler.push(profil);
    },
    async slett(id: string) {
      profiler = profiler.filter((p) => p.id !== id);
      if (aktivId === id) aktivId = null;
    },
    async hentAktivId() {
      return aktivId;
    },
    async settAktivId(id: string | null) {
      aktivId = id;
    },
    snapshot() {
      return { profiler: [...profiler], aktivId };
    },
    hentSync(id: string) {
      return profiler.find((p) => p.id === id);
    },
  };
}
