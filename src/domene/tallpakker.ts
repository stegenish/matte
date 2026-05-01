import { tallTilNavn } from "./tallNavn";

export type TallModus = "lese" | "skrive";

export interface TallOppgave {
  modus: TallModus;
  tall: number;
  navn: string;
  // For "lese": fire alternativer (ett riktig + tre distraktorer), shufflet.
  // For "skrive": ikke brukt.
  alternativer?: number[];
}

export interface TallPakke {
  id: string;
  navn: string;
  beskrivelse: string;
  modus: TallModus;
  generer: () => TallOppgave[];
}

// Plukker tilfeldige tall i et område, alle unike.
function plukkUnikeTall(min: number, max: number, antall: number): number[] {
  const valgte = new Set<number>();
  let safety = 1000;
  while (valgte.size < antall && safety > 0) {
    safety--;
    const cand = min + Math.floor(Math.random() * (max - min + 1));
    valgte.add(cand);
  }
  return Array.from(valgte);
}

// Genererer 3 distraktor-tall i samme størrelsesorden som svaret.
export function lagDistraktorer(svar: number, antall = 3): number[] {
  const min = svar < 10 ? 0 : svar < 100 ? 10 : 100;
  const max = svar < 10 ? 9 : svar < 100 ? 99 : 999;
  const distraktorer = new Set<number>();

  // Foretrekk klassiske typiske feil først:
  // 1) tallreversering for 2-sifret (47 ↔ 74)
  if (svar >= 10 && svar < 100) {
    const tier = Math.floor(svar / 10);
    const ener = svar % 10;
    if (tier !== ener) {
      const reversert = ener * 10 + tier;
      if (reversert >= min) distraktorer.add(reversert);
    }
  }
  // 2) tier-naboer (47 → 37, 57)
  for (const offset of [10, -10, 1, -1, 20, -20]) {
    if (distraktorer.size >= antall) break;
    const cand = svar + offset;
    if (cand !== svar && cand >= min && cand <= max) {
      distraktorer.add(cand);
    }
  }
  // 3) tilfeldig fyll
  let safety = 200;
  while (distraktorer.size < antall && safety > 0) {
    safety--;
    const cand = min + Math.floor(Math.random() * (max - min + 1));
    if (cand !== svar) distraktorer.add(cand);
  }
  return Array.from(distraktorer).slice(0, antall);
}

// Stokker en array (Fisher–Yates).
function stokk<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function lagLeseOppgave(tall: number): TallOppgave {
  const distraktorer = lagDistraktorer(tall, 3);
  return {
    modus: "lese",
    tall,
    navn: tallTilNavn(tall),
    alternativer: stokk([tall, ...distraktorer]),
  };
}

function lagSkriveOppgave(tall: number): TallOppgave {
  return {
    modus: "skrive",
    tall,
    navn: tallTilNavn(tall),
  };
}

function antall(min: number, max: number, antallOppgaver: number): number[] {
  return plukkUnikeTall(min, max, antallOppgaver);
}

export const TALL_PAKKER: TallPakke[] = [
  {
    id: "lese-1-20",
    navn: "Les tall (1–20)",
    beskrivelse: "Hvilket tall er dette? Velg riktig navn.",
    modus: "lese",
    generer: () => antall(1, 20, 8).map(lagLeseOppgave),
  },
  {
    id: "lese-2sifret",
    navn: "Les tall (2-sifret)",
    beskrivelse: "Hvilket tall er dette? Velg riktig navn.",
    modus: "lese",
    generer: () => antall(10, 99, 8).map(lagLeseOppgave),
  },
  {
    id: "skrive-1-20",
    navn: "Skriv tall (1–20)",
    beskrivelse: "Skriv tallet du leser.",
    modus: "skrive",
    generer: () => antall(1, 20, 8).map(lagSkriveOppgave),
  },
  {
    id: "skrive-2sifret",
    navn: "Skriv tall (2-sifret)",
    beskrivelse: "Skriv tallet du leser.",
    modus: "skrive",
    generer: () => antall(10, 99, 8).map(lagSkriveOppgave),
  },
];

export function tallPakkeMedId(id: string): TallPakke | undefined {
  return TALL_PAKKER.find((p) => p.id === id);
}

// Poeng for tall-oppgaver: enklere enn aritmetikk, så 1 poeng per riktig.
export const POENG_PER_TALL_OPPGAVE = 1;
