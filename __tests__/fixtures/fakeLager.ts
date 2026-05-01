import type { ProfilLager } from "@/src/lagring/profilLager";
import type { Profil } from "@/src/domene/profil";

// In-memory implementasjon av ProfilLager — for tester uten localStorage.
export function lagFakeLager(seed: Profil[] = []): ProfilLager {
  let profiler: Profil[] = [...seed];
  let aktivId: string | null = null;
  return {
    hentAlle: () => [...profiler],
    hent: (id: string) => profiler.find((p) => p.id === id),
    lagre: (profil: Profil) => {
      profiler = profiler.filter((p) => p.id !== profil.id);
      profiler.push(profil);
    },
    slett: (id: string) => {
      profiler = profiler.filter((p) => p.id !== id);
      if (aktivId === id) aktivId = null;
    },
    hentAktivId: () => aktivId,
    settAktivId: (id: string | null) => {
      aktivId = id;
    },
  };
}
