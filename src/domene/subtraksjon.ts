import type { Oppgave } from "./typer";

export interface Subtraksjonsoppgave extends Oppgave {
  operasjon: "-";
}

export type Subtraksjonsfase = "legg-til" | "ta-bort" | "svar";
export type BallTilstand = "tom" | "igjen" | "borte";

export interface Ballmodell {
  baller: BallTilstand[];
}

export function lagSubtraksjonsoppgave(
  maksimumA: number,
  random: () => number = Math.random,
): Subtraksjonsoppgave {
  const maksimum = Math.max(1, Math.floor(maksimumA));
  const a = 1 + Math.floor(random() * maksimum);
  const b = 1 + Math.floor(random() * a);
  return { a, b, operasjon: "-", svar: a - b };
}

export function lagBallmodell(antallRuter: number): Ballmodell {
  return {
    baller: Array(Math.max(0, Math.floor(antallRuter))).fill("tom"),
  };
}

export function antallBaller(modell: Ballmodell): number {
  return modell.baller.filter((ball) => ball !== "tom").length;
}

export function antallTattBort(modell: Ballmodell): number {
  return modell.baller.filter((ball) => ball === "borte").length;
}

export function antallIgjen(modell: Ballmodell): number {
  return modell.baller.filter((ball) => ball === "igjen").length;
}

export function faseFor(
  modell: Ballmodell,
  oppgave: Subtraksjonsoppgave,
): Subtraksjonsfase {
  if (antallBaller(modell) < oppgave.a) return "legg-til";
  if (antallTattBort(modell) < oppgave.b) return "ta-bort";
  return "svar";
}

export function klikkBall(
  modell: Ballmodell,
  index: number,
  oppgave: Subtraksjonsoppgave,
): Ballmodell {
  const ball = modell.baller[index];
  if (ball === undefined) return modell;

  const fase = faseFor(modell, oppgave);
  if (fase === "legg-til") {
    if (ball === "tom") return medBall(modell, index, "igjen");
    if (ball === "igjen") return medBall(modell, index, "tom");
    return modell;
  }

  if (ball === "borte") return medBall(modell, index, "igjen");
  if (ball === "igjen" && antallTattBort(modell) < oppgave.b) {
    return medBall(modell, index, "borte");
  }
  return modell;
}

export function lagEksempelmodell(
  kapasitet: number,
  oppgave: Subtraksjonsoppgave,
  antallSteg: number,
): Ballmodell {
  const steg = Math.max(
    0,
    Math.min(Math.floor(antallSteg), oppgave.a + oppgave.b),
  );
  let modell = lagBallmodell(kapasitet);

  for (let index = 0; index < Math.min(steg, oppgave.a); index++) {
    modell = klikkBall(modell, index, oppgave);
  }
  for (let index = 0; index < Math.max(0, steg - oppgave.a); index++) {
    modell = klikkBall(modell, index, oppgave);
  }
  return modell;
}

function medBall(
  modell: Ballmodell,
  index: number,
  tilstand: BallTilstand,
): Ballmodell {
  const baller = [...modell.baller];
  baller[index] = tilstand;
  return { baller };
}
