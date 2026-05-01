import type { Oppgave } from "./typer";

export interface Mønsterpakke {
  id: string;
  navn: string;
  beskrivelse: string;
  generer: () => Oppgave[];
}

const TALL_MED_9 = [9, 19, 29, 39, 49, 59, 69, 79, 89, 99] as const;
const TALL_MED_8 = [8, 18, 28, 38, 48, 58, 68, 78, 88, 98] as const;

function tiere(antall: number): number[] {
  return Array.from({ length: antall }, (_, i) => (i + 1) * 10);
}

function fraTilEnerSekvens(start: number, antall: number): number[] {
  return Array.from({ length: antall }, (_, i) => start + i);
}

// Genererer en addisjonsserie der hver oppgave starter på forrige svar:
// start=3, steg=4, antall=4  →  3+4=7, 7+4=11, 11+4=15, 15+4=19
function lagAddisjonsserie(start: number, steg: number, antall: number): Oppgave[] {
  return Array.from({ length: antall }, (_, i) => {
    const a = start + i * steg;
    return { a, b: steg, operasjon: "+" as const, svar: a + steg };
  });
}

export const FORHÅNDS_PAKKER: Mønsterpakke[] = [
  {
    id: "tiervenner",
    navn: "Tiervenner",
    beskrivelse: "10 minus hvert tall — finn vennen som mangler",
    generer: () =>
      fraTilEnerSekvens(1, 9).map((b) => ({
        a: 10,
        b,
        operasjon: "-",
        svar: 10 - b,
      })),
  },
  {
    id: "lily-pluss-1",
    navn: "+1 fra 9-tall",
    beskrivelse: "9+1, 19+1, … (tieroverganger)",
    generer: () =>
      TALL_MED_9.map((a) => ({ a, b: 1, operasjon: "+", svar: a + 1 })),
  },
  {
    id: "lily-pluss-2",
    navn: "+2 fra 8-tall",
    beskrivelse: "8+2, 18+2, … (tieroverganger)",
    generer: () =>
      TALL_MED_8.map((a) => ({ a, b: 2, operasjon: "+", svar: a + 2 })),
  },
  {
    id: "lily-minus-1",
    navn: "−1 fra tiere",
    beskrivelse: "10−1, 20−1, … (tieroverganger)",
    generer: () =>
      tiere(10).map((a) => ({ a, b: 1, operasjon: "-", svar: a - 1 })),
  },
  {
    id: "lily-minus-2",
    navn: "−2 fra tiere",
    beskrivelse: "10−2, 20−2, …",
    generer: () =>
      tiere(10).map((a) => ({ a, b: 2, operasjon: "-", svar: a - 2 })),
  },
  {
    id: "dobling",
    navn: "Dobling",
    beskrivelse: "1+1, 2+2, … opp til 10+10",
    generer: () =>
      fraTilEnerSekvens(1, 10).map((a) => ({
        a,
        b: a,
        operasjon: "+",
        svar: a * 2,
      })),
  },
  {
    id: "halvering",
    navn: "Halvering",
    beskrivelse: "2÷2, 4÷2, … opp til 20÷2",
    generer: () =>
      fraTilEnerSekvens(1, 10).map((i) => ({
        a: i * 2,
        b: 2,
        operasjon: "÷",
        svar: i,
      })),
  },
  {
    id: "fem-gangen",
    navn: "Hopp i 5",
    beskrivelse: "5+5, 10+5, 15+5, … opp til 50",
    generer: () => lagAddisjonsserie(5, 5, 9),
  },
];

// Bygger en egendefinert pakke fra startall + steg.
// Validerer at antall er rimelig (1–20).
export function lagEgenPakke(
  start: number,
  steg: number,
  antall = 10,
): Mønsterpakke {
  const begrensetAntall = Math.max(1, Math.min(antall, 20));
  return {
    id: `egen-${start}-${steg}-${begrensetAntall}`,
    navn: `Hopp ${steg} fra ${start}`,
    beskrivelse: `${start}+${steg}, ${start + steg}+${steg}, … (${begrensetAntall} oppgaver)`,
    generer: () => lagAddisjonsserie(start, steg, begrensetAntall),
  };
}

export function pakkeMedId(id: string): Mønsterpakke | undefined {
  return FORHÅNDS_PAKKER.find((p) => p.id === id);
}
