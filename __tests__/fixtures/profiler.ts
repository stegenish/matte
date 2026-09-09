import { lagNyProfil, type Profil } from "@/src/domene/profil";

// Lett-vekt fixtures for å rendre komponenter mot forskjellige profil-tilstander.

export function nyProfil(navn = "Lily", avatar = "🦊"): Profil {
  return lagNyProfil(navn, avatar);
}

export function profilMedPoeng(poeng: number): Profil {
  return {
    ...nyProfil(),
    poeng,
  };
}
