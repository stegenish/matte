import type { Oppgave } from "./typer";

// Detektér om en oppgave krysser en tier-grense.
// Bare relevant for + og - der det er en faktisk regnestrategi.
export function harTieroverganger(oppgave: Oppgave): boolean {
  const a = Math.abs(oppgave.a);
  const b = Math.abs(oppgave.b);
  if (oppgave.operasjon === "+") {
    return (a % 10) + (b % 10) >= 10;
  }
  if (oppgave.operasjon === "-") {
    return a % 10 < b % 10;
  }
  return false;
}

// Poeng = basis (sifre i svaret) + vanskelighetsbonus
//
// Basis: antall sifre i svaret, capped på 6.
// Bonus:
//   × +1
//   ÷ +2
//   tieroverganger +1 (gjelder + og -)
//   tresifret eller mer svar +1
//
// Mål: jevn progresjon på tvers av operasjoner og alderstrinn,
// så Lily som gjør 1-sifret pluss klatrer i samme rytme som
// Lineus som gjør gangetabellen.
export function poengForOppgave(oppgave: Oppgave): number {
  const sifre = Math.min(String(Math.abs(oppgave.svar)).length, 6);
  const operasjonsBonus =
    oppgave.operasjon === "×" ? 1 : oppgave.operasjon === "÷" ? 2 : 0;
  const tieroverganger = harTieroverganger(oppgave) ? 1 : 0;
  const tresifretBonus = sifre >= 3 ? 1 : 0;
  return sifre + operasjonsBonus + tieroverganger + tresifretBonus;
}
