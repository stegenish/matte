import type { Oppgave, Operasjon } from "./typer";
import type { FaktaStatus, Profil } from "./profil";
import { plukkVanskeligste, vanskelighetsskår } from "./faktaStatus";

export const ANTALL_DAGLIGE = 5;
export const DAGLIG_BONUS = 15;

// Konverterer en faktaStatus-nøkkel tilbake til en Oppgave.
// Returnerer null for tall-oppgaver eller andre nøkler vi ikke kan tolke.
export function nøkkelTilOppgave(nøkkel: string): Oppgave | null {
  if (nøkkel.startsWith("tall:")) return null;
  const match = nøkkel.match(/^(\d+)([+\-×÷])(\d+)$/);
  if (!match) return null;
  const a = Number(match[1]);
  const op = match[2] as Operasjon;
  const b = Number(match[3]);
  const svar =
    op === "+" ? a + b
    : op === "-" ? a - b
    : op === "×" ? a * b
    : a / b;
  return { a, b, operasjon: op, svar };
}

// Lager 5 oppgaver kuratert fra det profilen sliter mest med.
// Hvis profilen har lite faktaStatus, fylles det ut med standard 1-sifret pluss.
export function lagDagligUtfordring(profil: Profil): Oppgave[] {
  // Hovedkilde: vanskeligste fakta som faktisk har feile-svar
  const dårlige = profil.faktaStatus
    .filter((f) => f.feile > 0)
    .sort((a, b) => vanskelighetsskår(b) - vanskelighetsskår(a));
  const fraFakta: Oppgave[] = [];
  for (const f of dårlige) {
    const o = nøkkelTilOppgave(f.oppgaveNøkkel);
    if (o) fraFakta.push(o);
    if (fraFakta.length >= ANTALL_DAGLIGE) break;
  }
  // Fyll opp med standard 1-sifret pluss for nye/svake profiler
  while (fraFakta.length < ANTALL_DAGLIGE) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    fraFakta.push({ a, b, operasjon: "+", svar: a + b });
  }
  return fraFakta;
}

function isoDato(dato: Date = new Date()): string {
  return dato.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function harGjortIDag(profil: Profil): boolean {
  return profil.dagligUtfordringSistGjort === isoDato();
}

export function markerGjortIDag(profil: Profil): Profil {
  return { ...profil, dagligUtfordringSistGjort: isoDato() };
}
