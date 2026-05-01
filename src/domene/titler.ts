// Adjektiv går i syklus innen hver tittel: når alle adjektiv er oppnådd,
// går man videre til neste tittel og starter på adjektiv[0] igjen.
export const ADJEKTIV = ["Nølende", "Modig", "Snedig", "Ustoppelig"] as const;

export const TITLER = [
  "Tellestarter",
  "Talltroll",
  "Sifferspeider",
  "Plusspilot",
  "Mattenisse",
  "Brøkjeger",
  "Trekantkriger",
  "Regnemester",
  "Tallhelt",
  "Gangekonge",
  "Mattemagiker",
  "Sifferalkymist",
  "Geometrigud",
  "Mattefjellets vokter",
  "Tallenes stormester",
] as const;

export const ANTALL_NIVÅER = ADJEKTIV.length * TITLER.length;

export interface Nivå {
  index: number;
  adjektiv: string;
  tittel: string;
  poengGrense: number;
}

// Poenggrenser vokser litt raskere enn lineært:
// 0, 7, 11, 16, 22, 30, 38, 47, 58, 70, 83, ...
// Tunable senere — bare juster denne funksjonen.
export function poengGrenseForNivå(n: number): number {
  if (n <= 0) return 0;
  return Math.round(5 + 2 * n + 0.3 * n * n);
}

export function nivåForIndex(index: number): Nivå {
  const begrenset = Math.max(0, Math.min(index, ANTALL_NIVÅER - 1));
  const adjektivIndex = begrenset % ADJEKTIV.length;
  const tittelIndex = Math.floor(begrenset / ADJEKTIV.length);
  return {
    index: begrenset,
    adjektiv: ADJEKTIV[adjektivIndex],
    tittel: TITLER[tittelIndex],
    poengGrense: poengGrenseForNivå(begrenset),
  };
}

export function nivåForPoeng(poeng: number): Nivå {
  let funnet = 0;
  for (let i = 1; i < ANTALL_NIVÅER; i++) {
    if (poengGrenseForNivå(i) <= poeng) funnet = i;
    else break;
  }
  return nivåForIndex(funnet);
}
