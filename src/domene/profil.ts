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
  sistInnstillinger: Innstillinger | null;
  faktaStatus: FaktaStatus[];
  statistikk: ProfilStatistikk;
  dagligUtfordringSistGjort: string | null;
  funFactsSamlet: string[];
  lydAv: boolean;
  lynRekord: number; // høyeste antall riktige i lyn-runde
}

export function lagNyProfil(navn: string, avatar: string): Profil {
  return {
    schemaVersjon: PROFIL_SCHEMA_VERSJON,
    id: lagId(),
    navn,
    avatar,
    tilbehør: [],
    poeng: 0,
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
    lynRekord: 0,
  };
}

export function giPoeng(profil: Profil, poeng: number): Profil {
  return { ...profil, poeng: profil.poeng + poeng };
}

// Migrasjons-register: hver oppføring tar data på versjon N og returnerer data på versjon N+1.
// Når PROFIL_SCHEMA_VERSJON bumpes, legg til migrasjon for forrige versjon her.
//
// Eksempel ved fremtidig versjon 2:
//   1: (data) => ({ ...data, schemaVersjon: 2, nyttFelt: defaultverdi }),
const MIGRASJONER: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {};

// Kjører nødvendige migrasjoner inntil dataen matcher gjeldende skjemaversjon.
// Returnerer rådataen uendret hvis ingen migrasjon er nødvendig (eller mulig).
export function migrerProfilData(rådata: unknown): unknown {
  if (!rådata || typeof rådata !== "object") return rådata;
  let data = { ...(rådata as Record<string, unknown>) };
  // Hvis schemaVersjon mangler, anta versjon 1 (vi startet på 1)
  if (typeof data.schemaVersjon !== "number") data.schemaVersjon = 1;
  while (
    typeof data.schemaVersjon === "number" &&
    data.schemaVersjon < PROFIL_SCHEMA_VERSJON
  ) {
    const migrasjon = MIGRASJONER[data.schemaVersjon];
    if (!migrasjon) break; // Ingen migrasjon registrert — la fyllInnDefaults håndtere
    data = migrasjon(data);
  }
  return data;
}

// Defensiv lasting: kjør migrasjoner og fyll inn manglende felter med defaults.
// Brukes både ved lasting fra localStorage og ved fremtidig schema-migrering.
export function fyllInnDefaults(rådata: unknown): Profil | null {
  const migrert = migrerProfilData(rådata);
  if (!migrert || typeof migrert !== "object") return null;
  const r = migrert as Partial<Profil> & Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.navn !== "string") return null;

  const standardStatistikk: ProfilStatistikk = {
    totaltRiktige: 0,
    totaltFeil: 0,
    høyesteStreak: 0,
    øvingstyperBrukt: [],
  };
  const poeng = typeof r.poeng === "number" ? r.poeng : 0;

  return {
    schemaVersjon: PROFIL_SCHEMA_VERSJON,
    id: r.id,
    navn: r.navn,
    avatar: typeof r.avatar === "string" ? r.avatar : STANDARD_AVATARER[0],
    tilbehør: Array.isArray(r.tilbehør) ? r.tilbehør : [],
    poeng,
    sistInnstillinger: (r.sistInnstillinger as Innstillinger | null) ?? null,
    faktaStatus: Array.isArray(r.faktaStatus) ? r.faktaStatus : [],
    statistikk: { ...standardStatistikk, ...(r.statistikk ?? {}) },
    dagligUtfordringSistGjort:
      typeof r.dagligUtfordringSistGjort === "string"
        ? r.dagligUtfordringSistGjort
        : null,
    funFactsSamlet: Array.isArray(r.funFactsSamlet) ? r.funFactsSamlet : [],
    lydAv: typeof r.lydAv === "boolean" ? r.lydAv : false,
    lynRekord: typeof r.lynRekord === "number" ? r.lynRekord : 0,
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
