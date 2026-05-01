import type { Oppgave } from "./typer";

// 1 poeng per siffer i svaret (maks 6), +5 for ×, +10 for ÷
export function poengForOppgave(oppgave: Oppgave): number {
  const sifre = Math.min(String(Math.abs(oppgave.svar)).length, 6);
  const bonus = oppgave.operasjon === "×" ? 5 : oppgave.operasjon === "÷" ? 10 : 0;
  return sifre + bonus;
}
