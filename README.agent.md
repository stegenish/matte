# README.agent — Matteapp

Rask orientering for agenter. Les denne i stedet for å utforske kildekoden fra scratch.

---

## Hva er dette?

En matteapp for tre barn: **Lineus**, **Lily** og **Kian**. Barnevennlig design med Comic Sans, store knapper, emojis og fargerike tilbakemeldinger. Norsk UI.

- **Startside:** `app/page.tsx` — hilsen + "Start!"-knapp til `/oppgaver`
- **Oppgaveside:** `app/oppgaver/page.tsx` — hoved-app med tabs og poengsum

---

## Arkitektur

```
app/page.tsx                    Startside (landing)
app/oppgaver/page.tsx           Hoved-app (OppgaverSide)
app/oppgaver/OppgaveListe.tsx   Komponent for oppgaveliste
app/MatteOppgave.tsx            IKKE I BRUK — gammel prototype
app/layout.tsx                  Root layout (fonts, metadata)
app/globals.css                 Tailwind v4 setup
```

---

## Tabs

`OppgaverSide` har tre tabs (`TabId = "oppgaver" | "lily" | "test"`):

### Tab: Oppgaver
Bruker velger innstillinger og genererer oppgaver.

**Innstillinger:**
- `sifrerA` / `sifrerB`: 1–3 sifre i hvert tall
- `operasjoner`: en eller flere av `+`, `-`, `×`, `÷`
- `antallOppgaver`: 5, 10, 15 eller 20

**Visning:** Innstillinger-sidebar til venstre, `<OppgaveListe>` + Gangetabell (10×10) til høyre.

### Tab: Lily
Fastdefinerte oppgaver tilpasset Lily:
- **LILY_PLUSS**: 20 oppgaver — tall som slutter på 9 (+1) og 8 (+2): `[9+1, 19+1, …, 8+2, 18+2, …]`
- **LILY_MINUS**: 20 oppgaver — tilsvarende subtraksjon: `[10−1, 20−1, …, 10−2, …]`
- To `<OppgaveListe>`-komponenter side-by-side med Enter-navigering mellom dem via `useRef<OppgaveListeHandle>`.

### Tab: Test
Tom stub (`<div />`). Ikke implementert.

---

## Nøkkeltyper

```typescript
// Fra OppgaveListe.tsx (eksportert)
type Operasjon = "+" | "-" | "×" | "÷";

interface Oppgave {
  a: number;
  b: number;
  operasjon: Operasjon;
  svar: number;
}

interface OppgaveListeHandle {
  focusInput: (i: number) => void;  // ForwardRef-handle
}

// Fra page.tsx
interface Innstillinger {
  sifrerA: number;
  sifrerB: number;
  operasjoner: Operasjon[];
  antallOppgaver: number;
}
```

---

## Oppgavegenerering (`page.tsx`)

```typescript
tilfeldigMedSifre(n)  // n=1 → 1–9, n=2 → 10–99, n=3 → 100–999
lagOppgave(innstillinger)  // Velger operasjon tilfeldig fra innstillinger.operasjoner
```

Spesialregler:
- **Subtraksjon:** `a >= b` alltid (aldri negativt svar)
- **Divisjon:** `b` har `sifrerB` sifre, kvotienten er 1–9, `a = b × kvotient`
  - *Bug:* `sifrerA` ignoreres for divisjon

---

## Poenglogikk (`OppgaveListe.tsx`)

```typescript
poengForOppgave(oppgave):
  sifre = min(antall sifre i svar, 6)   // Basispoenget
  bonus = × → +5,  ÷ → +10,  +/- → 0
  return sifre + bonus
```

Poeng akkumuleres i `poeng`-state i `OppgaverSide` og vises øverst.

---

## OppgaveListe-komponent

**Props:** `oppgaver`, `leggTilPoeng`, `onNyRunde`, `onEnterAt?`

**State:** `svar: string[]`, `sjekket: boolean[]`

**Logikk:**
- `sjekkEtt(i)` — sjekker én oppgave ved blur/Enter
- `sjekkAlle()` — knappen "Sjekk svar 🔍" sjekker alle med input
- Klikk på feil svar nullstiller og lar brukeren prøve igjen
- "Ny runde 🎲" vises når `sjekket.every(Boolean)` — *bug: aldri true om felt er tomme*
- Reset via `useEffect` på `[oppgaver]`

---

## Kjente bugs / teknisk gjeld

1. **Ingen tester** — Jest ikke installert, ingen testfiler, bryter CLAUDE.md-krav om TDD
2. **`sjekkAlle` UX-bug** — tomme felt setter aldri `sjekket[i] = true`, så "Ny runde"-knappen vises aldri om noen felt er tomme
3. **Divisjon ignorerer `sifrerA`** — kvotienten er alltid 1–9 uavhengig av innstillingen
4. **`MatteOppgave.tsx` ubrukt** — prototype-artefakt, bør slettes
5. **`layout.tsx` boilerplate** — `title: "Create Next App"`, `lang="en"` mens alt er norsk
6. **Tom "test"-tab** synlig for brukerne

---

## Styling

- **Font:** `fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive"` — inline på tre steder
- **Farger:** gul bakgrunn (`bg-yellow-100`), grønt = riktig, rødt = feil, blått = input
- **Layout:** Flex, responsive med `md:`-prefix — kolonne på mobil, rad på desktop
- **Tailwind v4** via `@tailwindcss/postcss`

---

## Tech stack

| Teknologi | Versjon |
|-----------|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.3 |
| Tailwind CSS | v4 |
| TypeScript | 5.x, strict mode |
| pnpm | pakkebehandler |
| Jest | *ikke installert ennå* |

Scripts: `pnpm dev`, `pnpm build`, `pnpm lint` (ingen `test`-script).
