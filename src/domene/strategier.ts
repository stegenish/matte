import type { Oppgave } from "./typer";

// En strategi forklarer hvordan man kan tenke på en oppgave for å løse den.
// Vises som hjelp etter feil svar.
export interface Strategi {
  id: string;
  navn: string;
  steg: string[]; // hver linje i forklaringen
}

// Velg riktig strategi for en gitt oppgave. null hvis ingen passer.
export function strategiForOppgave(oppgave: Oppgave): Strategi | null {
  if (oppgave.operasjon === "+" && harTieroverganger(oppgave.a, oppgave.b)) {
    return tieroverganerPluss(oppgave.a, oppgave.b);
  }
  if (oppgave.operasjon === "-" && oppgave.a % 10 < oppgave.b % 10) {
    return tieroverganerMinus(oppgave.a, oppgave.b);
  }
  if (oppgave.operasjon === "×" && oppgave.a >= 2 && oppgave.b >= 2) {
    return distributivGanging(oppgave.a, oppgave.b);
  }
  return null;
}

function harTieroverganger(a: number, b: number): boolean {
  return (a % 10) + (b % 10) >= 10;
}

function tieroverganerPluss(a: number, b: number): Strategi {
  const tilTi = 10 - (a % 10); // hvor mye trengs for å nå neste tier
  const rest = b - tilTi;
  return {
    id: "tier-pluss",
    navn: "Hopp via tier",
    steg: [
      `${a} + ${b} = ?`,
      `Del ${b} i ${tilTi} + ${rest}`,
      `${a} + ${tilTi} = ${a + tilTi}`,
      `${a + tilTi} + ${rest} = ${a + b}`,
    ],
  };
}

function tieroverganerMinus(a: number, b: number): Strategi {
  const enerA = a % 10;
  const førsteSteg = enerA;
  const restSteg = b - førsteSteg;
  return {
    id: "tier-minus",
    navn: "Trekk fra steg for steg",
    steg: [
      `${a} − ${b} = ?`,
      `Del ${b} i ${førsteSteg} + ${restSteg}`,
      `${a} − ${førsteSteg} = ${a - førsteSteg}`,
      `${a - førsteSteg} − ${restSteg} = ${a - b}`,
    ],
  };
}

function distributivGanging(a: number, b: number): Strategi {
  // Del den større faktoren i to like (eller nesten like) deler.
  // Eks: 7×8 = 7×4 + 7×4 = 28+28 = 56
  const større = Math.max(a, b);
  const mindre = Math.min(a, b);
  const halv1 = Math.floor(større / 2);
  const halv2 = større - halv1;
  return {
    id: "distributiv-gang",
    navn: "Del opp og legg sammen",
    steg: [
      `${a} × ${b} = ?`,
      `Del ${større} i ${halv1} + ${halv2}`,
      `${mindre} × ${halv1} = ${mindre * halv1}`,
      `${mindre} × ${halv2} = ${mindre * halv2}`,
      `${mindre * halv1} + ${mindre * halv2} = ${a * b}`,
    ],
  };
}
