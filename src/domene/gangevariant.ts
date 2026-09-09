import { poengForOppgave } from "./poeng";

export type GangeVariant =
  | "klassisk"           // 7 × 8 = ?
  | "manglende-faktor"   // ? × 8 = 56
  | "omvendt"            // 56 ÷ 8 = ?
  | "sant-usant";        // 7 × 8 = 54 — riktig eller feil?

export const ALLE_VARIANTER: GangeVariant[] = [
  "klassisk",
  "manglende-faktor",
  "omvendt",
  "sant-usant",
];

interface GangeOppgaveGrunnlag {
  a: number;
  b: number;
  produkt: number;
}

export type GangeOppgave =
  | (GangeOppgaveGrunnlag & {
      variant: "klassisk";
      manglerSide?: never;
      påstand?: never;
      påstandRiktig?: never;
    })
  | (GangeOppgaveGrunnlag & {
      variant: "manglende-faktor";
      manglerSide: "a" | "b";
      påstand?: never;
      påstandRiktig?: never;
    })
  | (GangeOppgaveGrunnlag & {
      variant: "omvendt";
      manglerSide?: never;
      påstand?: never;
      påstandRiktig?: never;
    })
  | (GangeOppgaveGrunnlag & {
      variant: "sant-usant";
      manglerSide?: never;
      påstand: number;
      påstandRiktig: boolean;
    });

export type SantUsantOppgave = Extract<GangeOppgave, { variant: "sant-usant" }>;
export type GangeInputOppgave = Exclude<GangeOppgave, { variant: "sant-usant" }>;

export interface GangetabellInnstillinger {
  tabeller: number[];        // hvilke gangetabell-rader, f.eks. [2, 5, 10]
  varianter: GangeVariant[]; // hvilke varianter blandes inn
  antallOppgaver: number;
}

// Hva er det riktige svaret for en variant-oppgave?
// For sant-usant er "svaret" om påstanden er riktig (1 = sant, 0 = usant).
export function fasitFor(o: GangeOppgave): number {
  switch (o.variant) {
    case "sant-usant":
      return o.påstandRiktig ? 1 : 0;
    case "klassisk":
      return o.produkt;
    case "manglende-faktor":
      return o.manglerSide === "a" ? o.a : o.b;
    case "omvendt":
      return o.a;
  }
}

// Genererer en variant-oppgave for gitt a, b og variant.
export function lagGangeOppgave(
  a: number,
  b: number,
  variant: GangeVariant,
  random: () => number = Math.random,
): GangeOppgave {
  const produkt = a * b;
  if (variant === "sant-usant") {
    const skalVæreSant = random() > 0.5;
    let påstand = produkt;
    if (!skalVæreSant) {
      // Plausible feil: ±1, ±2, eller naboer i samme tabell (10 mindre/mer)
      const muligeOffset = [-3, -2, -1, 1, 2, 3, -10, 10];
      const offset = muligeOffset[Math.floor(random() * muligeOffset.length)];
      påstand = Math.max(0, produkt + offset);
      // Sjekk at påstanden ikke utilsiktet er riktig
      if (påstand === produkt) påstand = produkt + 1;
    }
    return {
      variant,
      a,
      b,
      produkt,
      påstand,
      påstandRiktig: påstand === produkt,
    };
  }
  if (variant === "manglende-faktor") {
    const manglerSide = random() > 0.5 ? "a" : "b";
    return { variant, a, b, produkt, manglerSide };
  }
  return { variant, a, b, produkt };
}

// Genererer en runde med blandede variant-oppgaver fra gitte tabeller.
export function lagGangerunde(
  innstillinger: GangetabellInnstillinger,
  random: () => number = Math.random,
): GangeOppgave[] {
  const { tabeller, varianter, antallOppgaver } = innstillinger;
  if (tabeller.length === 0 || varianter.length === 0) return [];
  const oppgaver: GangeOppgave[] = [];
  for (let i = 0; i < antallOppgaver; i++) {
    const a = tabeller[Math.floor(random() * tabeller.length)];
    const b = 1 + Math.floor(random() * 10);
    const variant = varianter[Math.floor(random() * varianter.length)];
    oppgaver.push(lagGangeOppgave(a, b, variant, random));
  }
  return oppgaver;
}

// Poeng for en variant-oppgave. Klassisk/manglende-faktor/omvendt teller som
// vanlig ganging (sifre + 1), sant-usant gir 1 poeng (enklere/raskere).
export function poengForGangeOppgave(o: GangeOppgave): number {
  if (o.variant === "sant-usant") return 1;
  return poengForOppgave({
    a: o.a,
    b: o.b,
    operasjon: "×",
    svar: o.produkt,
  });
}
