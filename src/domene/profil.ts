import type { Innstillinger } from "./oppgaver";

export const PROFIL_SCHEMA_VERSJON = 1;

// Standard avatar-sett. Tilbehør låses opp som progresjon (Fase 2+).
export const STANDARD_AVATARER = [
  "🦊", "🐢", "🦄", "🐉", "🦉", "🐺", "🦁",
  "🐧", "🦋", "🐙", "🦝", "🐸", "🐨",
] as const;

export interface FaktaStatus {
  oppgaveNøkkel: string;        // "7×8"
  rette: number;
  feile: number;
  sistVist: string;             // ISO-dato
}

export interface ProfilStatistikk {
  totaltRiktige: number;
  totaltFeil: number;
  høyesteStreak: number;
  øvingstyperBrukt: string[];
}

export interface Profil {
  schemaVersjon: typeof PROFIL_SCHEMA_VERSJON;
  id: string;
  navn: string;
  avatar: string;
  tilbehør: string[];
  poeng: number;
  tittelIndex: number;
  tårnEtasje: number;
  sistInnstillinger: Innstillinger | null;
  faktaStatus: FaktaStatus[];
  statistikk: ProfilStatistikk;
  dagligUtfordringSistGjort: string | null;
  funFactsSamlet: string[];
  lydAv: boolean;
}

export function lagNyProfil(navn: string, avatar: string): Profil {
  return {
    schemaVersjon: PROFIL_SCHEMA_VERSJON,
    id: lagId(),
    navn,
    avatar,
    tilbehør: [],
    poeng: 0,
    tittelIndex: 0,
    tårnEtasje: 0,
    sistInnstillinger: null,
    faktaStatus: [],
    statistikk: {
      totaltRiktige: 0,
      totaltFeil: 0,
      høyesteStreak: 0,
      øvingstyperBrukt: [],
    },
    dagligUtfordringSistGjort: null,
    funFactsSamlet: [],
    lydAv: false,
  };
}

// Defensiv lasting: fyll inn manglende felter med defaults.
// Brukes både ved lasting fra localStorage og ved fremtidig schema-migrering.
export function fyllInnDefaults(rådata: unknown): Profil | null {
  if (!rådata || typeof rådata !== "object") return null;
  const r = rådata as Partial<Profil> & Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.navn !== "string") return null;

  const standardStatistikk: ProfilStatistikk = {
    totaltRiktige: 0,
    totaltFeil: 0,
    høyesteStreak: 0,
    øvingstyperBrukt: [],
  };

  return {
    schemaVersjon: PROFIL_SCHEMA_VERSJON,
    id: r.id,
    navn: r.navn,
    avatar: typeof r.avatar === "string" ? r.avatar : STANDARD_AVATARER[0],
    tilbehør: Array.isArray(r.tilbehør) ? r.tilbehør : [],
    poeng: typeof r.poeng === "number" ? r.poeng : 0,
    tittelIndex: typeof r.tittelIndex === "number" ? r.tittelIndex : 0,
    tårnEtasje: typeof r.tårnEtasje === "number" ? r.tårnEtasje : 0,
    sistInnstillinger: (r.sistInnstillinger as Innstillinger | null) ?? null,
    faktaStatus: Array.isArray(r.faktaStatus) ? r.faktaStatus : [],
    statistikk: { ...standardStatistikk, ...(r.statistikk ?? {}) },
    dagligUtfordringSistGjort:
      typeof r.dagligUtfordringSistGjort === "string"
        ? r.dagligUtfordringSistGjort
        : null,
    funFactsSamlet: Array.isArray(r.funFactsSamlet) ? r.funFactsSamlet : [],
    lydAv: typeof r.lydAv === "boolean" ? r.lydAv : false,
  };
}

function lagId(): string {
  // crypto.randomUUID er tilgjengelig i moderne nettlesere og Node 19+
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for eldre miljø
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
