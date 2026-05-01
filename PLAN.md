# Implementeringsplan — Matteapp

Operativ plan for utvikling basert på `DESIGN3.md`. Inneholder valideringsstrategi, commit-rytme, milepæler, og hvordan subagenter/Chrome MCP brukes.

---

## Valideringsstrategi

### Tre-lags validering

| Lag | Verktøy | Kjøretid | Når |
|---|---|---|---|
| **Rask** | `pnpm test` (Jest) | ~1–2 s | Etter hver kodeendring som rører logikk |
| **Middels** | `review-codebase` subagent | ~1–2 min, bakgrunn | Etter hver milepæl (1–5 tester for ett konsept) |
| **Sakte** | Chrome MCP via subagent | ~30–60 s + interaksjon | Etter hver UI-milepæl |

### Når Chrome MCP brukes
**Ja:**
- Etter UI-milepæler (ny komponent, ny visning, layout-endring)
- Etter feilrettinger som rører UI
- Etter responsive endringer (sjekk mobil + desktop)
- Som happy-path-røyktest etter hver fase

**Nei:**
- Etter ren logikk-endring uten UI-effekt
- Etter test-tilføyelser
- Etter dokumentasjons-oppdateringer

### Når review-codebase brukes
- Etter hver fase (se §Faser nedenfor)
- Kjøres i bakgrunn for å ikke blokkere videre arbeid
- Resultatet leses og adresseres før neste fase

### Røyktest-flyt (E2E)
Etter hver fase som rører UI: kjør én komplett gjennomgang via Chrome MCP:
1. Last side
2. Velg profil (eller opprett)
3. Start en runde
4. Svar på minst én oppgave
5. Verifiser poeng oppdateres
6. Sjekk console for feil

Implementeres som et "skript" subagenten kan kjøre.

---

## Commit-rytme

### Prinsipp
- Commit per **konsept** som er ferdig nok til å rulles tilbake til hvis vi havner i trøbbel
- Ikke per fil, ikke per prompt
- Hver commit: tester grønne + app laster uten feil
- Noen ganger kan en commit være liten ("rydd opp X"), andre ganger større ("legg til profilsystem"). Det må føles trygt å rulle tilbake.

### Tommelfingerregler
- **Aldri commit med rød test** — bryt opp arbeidet hvis nødvendig
- **Commit før risikofylt refaktorering** — så vi har et trygt punkt å rulle tilbake til
- **Commit etter hver milepæl** i §Faser — gir oss naturlige rollback-punkter
- **Commit-meldinger** følger CLAUDE.md: kort summary + prompts på slutten

### Rollback-strategi
- Hvis vi sitter fast: `git reset --hard <forrige commit>` eller `git revert`
- Bevarer alle commits — endrer ikke historikk (CLAUDE.md-regel)
- Hvis et eksperiment går galt: lag en branch *før* eksperimentet starter, eksperimenter der

### Tags per fase
Etter siste commit i hver fase: `git tag fase-N` (f.eks. `fase-0`, `fase-1`, …, `fase-15`).
Gjør det enkelt å gå tilbake til en kjent god tilstand: `git checkout fase-3`.

---

## Forberedelser (Fase 0)

### 0.1 Rydd opp kjente småproblemer (1 commit)
- Slett ubrukt `app/MatteOppgave.tsx`
- Fjern tom "test"-tab fra `oppgaver/page.tsx`
- Oppdater `app/layout.tsx`: norsk `lang="nb"`, riktig `title`/`description`
- Trekk ut `fontFamily`-stilen til én plass (Tailwind-klasse eller `layout.tsx`)

**Validering:** `pnpm test` + Chrome MCP røyktest (sjekk at appen fortsatt fungerer)

### 0.2 Baseline-tester for eksisterende logikk (1 commit)
TDD krever at vi har tester for det som finnes før vi refaktorerer.
- Test `lagOppgave` for hver operasjon (inkludert kjent bug: divisjon ignorerer `sifrerA`)
- Test `poengForOppgave`
- Test `tilfeldigMedSifre`

Disse blir regresjonsvern når vi flytter logikk rundt senere.

**Validering:** `pnpm test` (alle grønne)

### 0.3 Mappestruktur for fremtid (1 commit)
Forbered katalogene vi vet vi trenger:
```
src/
  domene/         # Ren forretningslogikk (oppgaver, poeng, titler)
  lagring/        # Tynt fasade-lag mot localStorage (senere Supabase)
  komponenter/    # Delte UI-byggeblokker
app/              # Next.js-sider (uendret plassering)
__tests__/        # Tester per modul
```
Flytt `lagOppgave`, `poengForOppgave` og `tilfeldigMedSifre` ut av `page.tsx` og inn i `src/domene/`.

**Hvorfor nå:** Future-proofing fra Fase 3 i CLAUDE.md — flytt logikk ut før vi bygger på den.

**Validering:** `pnpm test` + Chrome MCP røyktest

---

## Faser

Hver fase = 1–3 commits. Etter hver fase: `review-codebase`-subagent + Chrome MCP røyktest.

### Fase 1: Profilsystem
**Mål:** Velg/opprett profil med avatar, lagre i localStorage.

**Bygg:**
- `src/lagring/profilLager.ts` — fasade rundt localStorage med typed get/set
- `src/domene/profil.ts` — `Profil`-typen (full datamodell fra DESIGN3 §3)
- `app/profil/page.tsx` — velg eksisterende eller opprett ny
- Profilkontekst (React context) tilgjengelig i hele appen

**Tester:**
- profilLager: lagre/hente/slette
- Migrering: gammel localStorage-data uten alle felter får defaults

**Forventede commits:** 2–3
- "Profil-domenetyper og lagringsfasade"
- "Profilvelger-side med avatar"
- "Profilkontekst gjennom appen"

**Validering ved slutt:**
- Chrome MCP: opprett profil, last app på nytt, sjekk at profil huskes
- review-codebase

### Fase 2: Poeng + titler + adjektiv
**Mål:** Vise tittel og poeng per profil. Tittelopprykk feires.

**Bygg:**
- `src/domene/titler.ts` — ~60 (tittel × adjektiv)-kombinasjoner med poengmilepæler
- `src/domene/poeng.ts` — vanskelighetsbonus i stedet for operasjonsbonus
- `Poengvisning`-komponent oppdatert
- `Tittelvisning`-komponent
- Confetti-animasjon ved nytt opprykk

**Tester:**
- Tittel for gitt poengsum (tabell)
- Poengberegning per oppgavetype
- Vanskelighetsbonus

**Forventede commits:** 2–3

### Fase 3: Mattetårnet
**Mål:** Visuell makro-progresjon. Hver tittel = ny etasje.

**Bygg:**
- SVG-tårn med ~15 etasjer som lag
- `Tårn`-komponent som synliggjør lag basert på `tårnEtasje`
- Profilforside viser tårnet
- Fun facts knyttet til etasjer

**Tester:**
- Etasje-utregning fra titteltindex
- Snapshot-test av Tårn-komponent ved forskjellige nivåer

**Forventede commits:** 1–2

### Fase 4: Streak/kombo med skjold + comeback + maskot
**Mål:** Streak-system som ikke skaper angst. Maskot kommenterer.

**Bygg:**
- `src/domene/streak.ts` — ren logikk for skjold, comeback, perfekt runde
- `Streakvisning`-komponent
- Live mikro-feedback per oppgave: "Riktig! +3 ⭐⭐⭐"
- Maskot-komponent med tekstbobler

**Tester:**
- Streak-logikk: tilstandsmaskin (rett/feil/skjold/comeback)
- Bonus-utregning per kombotype

**Forventede commits:** 2

### Fase 5: Mønsterpakker (videreutvikling)
**Mål:** Erstatt hardkodede Lily-arrays med pakke-system.

**Bygg:**
- `src/domene/mønsterpakker.ts` — Pakke-type, generator-funksjon, fast bibliotek
- Pakkevelger-UI (forhåndsdefinerte + egendefinert)
- Pakker: Tiervenner, Dobling, +2 fra 8-tall (eksisterende), Tieroverganger, Halvering

**Tester:**
- Hver pakke genererer riktig sett oppgaver
- Egendefinert pakke (startall + steg)

**Forventede commits:** 2

### Fase 6: Tieroverganger og tiervenner som egne typer
**Mål:** Egne øvingstyper med ten-frame-visualisering.

**Bygg:**
- `TenFrame`-komponent (SVG)
- Tallinje-komponent
- Egne sider eller tab-modus per type

**Tester:**
- TenFrame-rendering (snapshot)
- Logikk-tester eksisterer fra mønsterpakker

**Forventede commits:** 1–2

### Fase 7: Tallgjenkjenning
**Mål:** Les tall (flervalg) + Skriv tall (input).

**Bygg:**
- `src/domene/tallNavn.ts` — `tallTilNavn(47) → "førtisju"` (norsk numerisk)
- `Flervalg`-komponent
- Plassverdi-visualisering

**Tester:**
- `tallTilNavn` for 0–999 (sample-baserte)
- Distraktor-genering for flervalg (tre realistiske feilsvar)

**Forventede commits:** 2

### Fase 8: Strategi-kort
**Mål:** Hjelp ved feil + proaktiv intro for nye typer.

**Bygg:**
- `src/domene/strategier.ts` — kort per oppgavetype
- `Strategikort`-komponent
- Proaktiv visning lagres per profil ("vist for X-type")

**Tester:**
- Velg riktig strategi for gitt feil-svar
- Profil markerer som vist

**Forventede commits:** 1–2

### Fase 9: Variasjon innen samme fakta
**Mål:** Gangetabell-drill blander format.

**Bygg:**
- `src/domene/oppgaveVariant.ts` — varianter (klassisk, manglende faktor, omvendt, sant/usant)
- Gangetabell-drill bruker variantene

**Tester:**
- Variant-generator produserer samme svar uavhengig av format
- Sant/usant: like sannsynlig sant og usant

**Forventede commits:** 1–2

### Fase 10: Per-stykke-statistikk
**Mål:** Lagre `faktaStatus` per oppgave.

**Bygg:**
- `src/domene/faktaStatus.ts` — oppdatering ved svar
- Brukes i daglig utfordring (Fase 12) — ingen UI-endring nå

**Tester:**
- faktaStatus oppdateres ved rett/feil
- Ny FaktaStatus opprettes første gang

**Forventede commits:** 1

### Fase 11: Lyn-runde
**Mål:** 60-sekunders modus med rekord.

**Bygg:**
- Tidsteller-komponent
- Rekord lagres per profil og pakke
- Bonus for ny rekord

**Tester:**
- Tidsteller stopper ved 0
- Rekord oppdateres kun ved bedre resultat

**Forventede commits:** 1–2

### Fase 12: Boss-kamp
**Mål:** Kuratert utfordring etter X riktige.

**Bygg:**
- Boss-komponent (visuell figur, dramatisk innramming)
- Logikk: dukker opp tilfeldig etter terskel

**Tester:**
- Trigger-logikk
- Boss-poeng-bonus

**Forventede commits:** 1

### Fase 13: Daglig utfordring
**Mål:** 3–5 kuraterte oppgaver per dag.

**Bygg:**
- Velger oppgaver basert på `faktaStatus` (vanskeligste)
- "Synlig på startsiden hvis ikke gjort i dag"
- Bonus + ny fun fact låses opp

**Tester:**
- Velgeralgoritme
- Datologikk: "i dag" basert på lokal dato

**Forventede commits:** 1–2

### Fase 14: Lyd
**Mål:** Korte lyder ved hendelser, mute per profil.

**Bygg:**
- `src/lyd.ts` — fasade rundt Audio API
- Mute-toggle i UI
- Lyder for: rett, feil, tittelopprykk, perfekt runde, comeback

**Tester:**
- Mute-tilstand persisteres per profil

**Forventede commits:** 1

### Fase 15: Sesjonsstruktur
**Mål:** ~5 min anbefalt sesjon, "ferdig for i dag!"-skjerm, velkommen tilbake.

**Bygg:**
- Sesjonstaking (start/stopp-tid)
- "Ferdig"-skjerm
- Bonus ved første sesjon en ny dag

**Tester:**
- Sesjonsoppsummering-utregning
- Datologikk for "ny dag"

**Forventede commits:** 1

### Fase 16: Supabase-migrering *(utelatt i første omgang)*
Tatt ut av initial scope. Vil tas opp igjen når vi har sett at appen blir brukt og det er konkret behov for sky-lagring.

---

## Kryssgående bekymringer

### Datamodell-evolusjon
Vi vet at `Profil` blir endret mange ganger underveis. To prinsipper:

1. **Defensiv lasting:** Når vi leser en profil fra lagring, fyll inn manglende felter med defaults. Aldri kast feil på gammel data.
2. **Versjonsfelt:** Legg `schemaVersjon: 1` i Profil fra dag 1. Hvis vi senere må gjøre "ekte" migrering (ikke bare default-utfylling), har vi ankeret klart.

### Test-fixtures
Lag `__tests__/fixtures/profiler.ts` med flere profiltilstander:
- Helt ny profil
- Profil mid-progresjon
- Profil med høy `tårnEtasje`, alle tilbehør låst opp
- Profil med dyp `faktaStatus` (mange feil på 7-gangen)

Brukes i komponenttester og snapshot-tester. Sparer mye gjentakelse.

### Reset for testing
"Tøm profil"-knapp et sted i UI eller via dev-snarvei (bare i dev-modus). Lett å reprodusere "ny bruker"-opplevelsen uten å åpne devtools.

### Snapshot-tester for nøkkelkomponenter
Tårn, Streakvisning, Tittelvisning. Fanger utilsiktede UI-regresjoner raskt — mye raskere enn Chrome MCP.

---

## Subagent-oppskrifter

### review-codebase
Kjøres etter hver fase. Tar 1–2 minutter, kjøres i bakgrunn. Rapporterer:
- Bugs i ny kode
- Refaktoreringsforslag
- Future-proofing-bekymringer
- Testresultat

### Chrome MCP røyktest-agent
**Foreslått oppskrift** (lages ved behov i Fase 1):
- Last `http://localhost:3000`
- Naviger gjennom: profilvelger → oppgaver → fullfør runde
- Sjekk console for feil
- Ta skjermbilde av nøkkelpunktene
- Rapporter visuelle avvik

Kjøres etter hver UI-milepæl. ~1 minutt totalt.

### Visuell regresjonsagent (valgfritt, senere)
- Tar skjermbilder før endringer
- Sammenligner med etter
- Rapporterer pikselforskjeller > terskel
- Kun for spesifikke layout-endringer der vi vil være sikre

---

## Førstelinje-arbeidsflyt

For hver milepæl:

1. **Skriv test først** (TDD per CLAUDE.md)
2. **Implementer** til testen blir grønn
3. **Kjør `pnpm test`** — alle grønne
4. **Hvis UI-endring:** Chrome MCP røyktest
5. **Commit** med kort summary + prompt
6. **Hvis fase ferdig:**
   - Kjør `review-codebase` i bakgrunn
   - Fortsett med neste fase mens den jobber
   - Tag commit med `fase-N`
7. **Adresser review-funn** før vi går videre til neste fase

---

## Åpne valg før vi starter Fase 0

- Skal `src/`-omleggingen i Fase 0.3 skje **før** Fase 1, eller kan vi vente til vi føler smerten?
  - **Min anbefaling:** Gjør det i Fase 0.3. Lavt kostnad nå, høyt kostnad senere.
- Skal vi lage en branch per fase eller jobbe på `master`?
  - **Min anbefaling:** master for nå. Fase 16 (Supabase) bør være branch.
- Skal jeg generere `titler.ts` med eksempler på 60 titler i Fase 2, eller ta det som eget prompt-pass?
  - **Min anbefaling:** Generer som del av Fase 2-arbeidet, men list dem i en tabell i commit-meldingen for enkel reverse-review.

---

## Estimerte commits totalt

| Fase | Commits |
|---|---|
| 0 | 3 |
| 1–15 | ~25–35 |
| **Totalt** | **~28–38 commits + 16 tags** |

Med commit-rytmen ovenfor får vi mange trygge rollback-punkter.

---

## Foreslåtte sjekkpunkter for brukertilbakemelding

Vi gjør ikke hele planen i ett strekk. Det er fire naturlige sjekkpunkter der appen er testbar med ekte barn — og der din tilbakemelding kan endre retning før vi har bygget mye på toppen:

| Sjekkpunkt | Etter fase | Hva er testbart |
|---|---|---|
| ~~CP1~~ | ~~Fase 1~~ | *Hoppes over — fortsett til CP2 første gang.* |
| **CP2** | Fase 4 | Motivasjonsmotoren er på plass — virker profil/streak/skjold/tittel/maskot bra? |
| **CP3** | Fase 7 | Lily-behovet dekket — fungerer tieroverganger, tiervenner og tallgjenkjenning? |
| **CP4** | Fase 9 | Lineus/Kian-behovet dekket — føles gangetabell-drill med faktavariasjon riktig? |

Mellom sjekkpunktene jobber jeg autonomt og kjører selvtester. Ved sjekkpunktet stopper jeg, oppsummerer hva som er gjort, og venter på tilbakemelding før vi fortsetter.

Faser 10–15 er mer "polish" og kan tas i én bolk etter CP4 hvis du ikke har spesifikke tilbakemeldinger.
