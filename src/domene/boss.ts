import type { Oppgave } from "./typer";

// Klassiske "vanskelige" gangetabell-stykker — fakta barn typisk strever med.
const HARDE_FAKTA: Array<[number, number]> = [
  [6, 7], [6, 8], [6, 9],
  [7, 8], [7, 9],
  [8, 9],
  [4, 7], [4, 9],
];

export const BOSS_BONUS = 20;

export function lagBossOppgave(random: () => number = Math.random): Oppgave {
  const [a, b] = HARDE_FAKTA[Math.floor(random() * HARDE_FAKTA.length)];
  return { a, b, operasjon: "×", svar: a * b };
}
