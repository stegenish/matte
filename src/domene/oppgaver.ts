import type { Operasjon, Oppgave } from "./typer";

export interface Innstillinger {
  sifrerA: number;
  sifrerB: number;
  operasjoner: Operasjon[];
  antallOppgaver: number;
}

// Tilfeldig tall med nøyaktig n sifre
export function tilfeldigMedSifre(n: number): number {
  const min = n === 1 ? 1 : Math.pow(10, n - 1);
  const max = Math.pow(10, n) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lagOppgave(innstillinger: Innstillinger): Oppgave {
  const { sifrerA, sifrerB, operasjoner } = innstillinger;
  const operasjon = operasjoner[Math.floor(Math.random() * operasjoner.length)];

  if (operasjon === "+") {
    const a = tilfeldigMedSifre(sifrerA);
    const b = tilfeldigMedSifre(sifrerB);
    return { a, b, operasjon, svar: a + b };
  }
  if (operasjon === "-") {
    const x = tilfeldigMedSifre(sifrerA);
    const y = tilfeldigMedSifre(sifrerB);
    // a >= b for å unngå negative svar
    const [a, b] = x >= y ? [x, y] : [y, x];
    return { a, b, operasjon, svar: a - b };
  }
  if (operasjon === "×") {
    const a = tilfeldigMedSifre(sifrerA);
    const b = tilfeldigMedSifre(sifrerB);
    return { a, b, operasjon, svar: a * b };
  }
  // ÷ — garantert heltallssvar; b bruker sifrerB, kvotienten er 1–9
  // KJENT BUG: sifrerA brukes ikke for divisjon — kvotienten er alltid 1–9
  const b = tilfeldigMedSifre(sifrerB);
  const svar = Math.floor(Math.random() * 9) + 1;
  return { a: b * svar, b, operasjon, svar };
}

export function lagOppgaver(innstillinger: Innstillinger): Oppgave[] {
  return Array.from({ length: innstillinger.antallOppgaver }, () =>
    lagOppgave(innstillinger),
  );
}
