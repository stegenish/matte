import type { Oppgave } from "./typer";
import type { FaktaStatus } from "./profil";

// Returnerer en stabil nøkkel som identifiserer et fakta (uavhengig av rekkefølge for ×).
// 7×8 og 8×7 har samme nøkkel "7×8" (smaller first). + og - er rekkefølge-sensitive.
export function nøkkelForOppgave(o: Oppgave): string {
  if (o.operasjon === "×") {
    const [min, max] = o.a <= o.b ? [o.a, o.b] : [o.b, o.a];
    return `${min}×${max}`;
  }
  if (o.operasjon === "÷") {
    return `${o.a}÷${o.b}`;
  }
  return `${o.a}${o.operasjon}${o.b}`;
}

// Oppdaterer faktaStatus-listen med ett nytt resultat. Returnerer en ny array.
export function oppdaterFaktaStatus(
  liste: FaktaStatus[],
  oppgaveNøkkel: string,
  riktig: boolean,
): FaktaStatus[] {
  const sistVist = new Date().toISOString();
  const idx = liste.findIndex((f) => f.oppgaveNøkkel === oppgaveNøkkel);
  if (idx === -1) {
    return [
      ...liste,
      {
        oppgaveNøkkel,
        rette: riktig ? 1 : 0,
        feile: riktig ? 0 : 1,
        sistVist,
      },
    ];
  }
  const eksisterende = liste[idx];
  const ny = [...liste];
  ny[idx] = {
    ...eksisterende,
    rette: eksisterende.rette + (riktig ? 1 : 0),
    feile: eksisterende.feile + (riktig ? 0 : 1),
    sistVist,
  };
  return ny;
}

// "Vanskelighetsskår" for et fakta — høyere tall = oftere feil.
// Brukes til å plukke ut hva som trenger mest øving (Fase 13).
export function vanskelighetsskår(f: FaktaStatus): number {
  const total = f.rette + f.feile;
  if (total === 0) return 0;
  return f.feile / total;
}

// Plukker ut N stykker fra faktaStatus som er "vanskeligst", begrenset til de man har sett.
export function plukkVanskeligste(
  liste: FaktaStatus[],
  antall: number,
): FaktaStatus[] {
  return [...liste]
    .sort((a, b) => vanskelighetsskår(b) - vanskelighetsskår(a))
    .slice(0, antall);
}
