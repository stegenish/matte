# Matteapp — agentoversikt

Denne filen beskriver hvor ansvar ligger og hvilke regler som må bevares. Les den før du endrer kode, og åpne deretter bare filene som eier området du skal arbeide med.

## Produkt

Matteapp er en norsk, barnevennlig matematikkapp for Lineus, Lily og Kian. Brukeren velger en lokal profil, løser oppgaver og bygger progresjon gjennom poeng, titler og et mattetårn.

Rutene er:

- `app/page.tsx`: profilvalg, velkomst, mattetårn og dagens utfordring.
- `app/oppgaver/page.tsx`: skall for oppgavefanene, profilhandlinger og feiringer.
- `app/utfordring/page.tsx`: dagens personlige utfordring.

## Ansvarsgrenser

```text
app/                         Ruter og sammensetting av funksjoner
app/oppgaver/*Tab.tsx        Innstillinger og visning for hver oppgavetype
app/oppgaver/Oppgave*.tsx    Vanlige regneoppgaver og svarfelt
src/komponenter/             Delt UI, profilkontekst og rundeorkestrering
src/domene/                  Rene regler, generatorer, typer og profiloverganger
src/lagring/                 Persistensgrensesnitt og localStorage-adapter
__tests__/                   Domene-, lagrings- og komponenttester
```

Legg regler i `src/domene`, ikke i en rute eller presentasjonskomponent. UI-komponenter kan velge når en handling skjer, men domenet avgjør hva handlingen betyr.

## Oppgaveflyt

`OppgaverSide` har fanene `oppgaver`, `subtraksjon`, `pakker`, `tall` og `gange`.

- `OppgaverTab.tsx` genererer vanlige `Oppgave`-objekter med `+`, `-`, `×` eller `÷`.
- `SubtraksjonTab.tsx` lærer bort `A − B = C` konkret: barnet legger til `A` baller, krysser ut `B` og svarer hvor mange som er igjen. Eksempelmodus animerer samme handling uten å registrere svar eller poeng.
- `PakkerTab.tsx` bruker navngitte mønsterpakker og samme `OppgaveListe`.
- `TallTab.tsx` bruker den diskriminerte unionen `TallOppgave` for lese- og skriveoppgaver.
- `GangeTab.tsx` bruker den diskriminerte unionen `GangeOppgave` for fire gangevarianter og kan starte `LynRunde`.

`useGenerertRunde` gir hver genererte runde en eksplisitt id. Listekomponenten skal bruke denne som React `key`, slik at svar og streak nullstilles ved ny runde. `useOppgaverunde` eier felles svar- og sjekketilstand og hindrer at Enter og blur registrerer samme svar to ganger. `RundeResultat` eier felles sluttvisning.

## Profil og progresjon

`ProfilProvider` er eneste UI-inngang til aktiv profil. Oppdateringer er funksjonelle og anvendes synkront på providerens siste profiltilstand. Persistens skjer sekvensielt etter tilstandsendringen, slik at raske oppdateringer ikke lagres i feil rekkefølge.

`Profil.poeng` er kilden til progresjon. Tittel og tårnetasje beregnes fra poeng med funksjonene i `src/domene/titler.ts`; de lagres ikke som separate profilfelt. Bruk `giPoeng` for alle poengendringer.

Svar registreres gjennom `useSvarOrkestrering`, som oppdaterer statistikk, faktastatus, streak og poeng. Scoring av vanlige oppgaver eies av `src/domene/poeng.ts`. Gangevarianter bruker den samme grunnregelen; eventuelle avvik må være eksplisitte modusregler.

## Persistens

`ProfilLager` er et asynkront grensesnitt. Standardadapteren lagrer profiler og aktiv profil-id i `localStorage`. Skrivninger serialiseres fordi lagring av en profil er en les–endre–skriv-operasjon over profilsamlingen.

Profilskjemaet normaliseres i `fyllInnDefaults`. Ved nye profilfelt:

1. øk `PROFIL_SCHEMA_VERSJON` når eksisterende data må transformeres;
2. legg migrasjonen i `MIGRASJONER`;
3. legg en trygg default i `fyllInnDefaults`;
4. legg til migrerings- og lagringstester.

## Viktige invariants

- Ett brukerforsøk registreres og premieres høyst én gang.
- Minst én valgt operasjon eller gangevariant beholdes.
- Subtraksjon genererer ikke negative svar. Den konkrete subtraksjonsfanen viser `B + ? = A` til barnet har svart riktig, slik at addisjonen ikke røper svaret.
- Divisjon genererer heltallssvar. `sifrerA` er foreløpig ikke en garantert begrensning for divisjon.
- Daglig bonus kan gis én gang per lokal kalenderdag; regelen håndheves av `belønnDagligUtfordring`.
- Nye varianter skal legges til i diskriminerte unions og håndteres eksplisitt i generator, fasit og UI.
- Profilskrivninger må bevare rekkefølgen de ble gjort i.

## Verifisering

Bruk pnpm:

```bash
pnpm test --runInBand path/to/fokusert.test.ts
pnpm test --runInBand
pnpm lint
pnpm build
```

Skriv først en test som viser ønsket oppførsel. Etter 1–5 tester for ett sammenhengende konsept skal en subagent med fersk kontekst gjennomgå endringen. Kjør hele suiten, lint og build før commit.

## Kjente begrensninger

- Divisjonsgeneratoren bruker `sifrerB` for divisor og en kvotient fra 1–9; `sifrerA` styrer derfor ikke dividendens sifferantall.
- Profilpersistens er lokal i nettleseren og synkroniseres ikke mellom enheter eller faner.
- Flere innstillingspaneler har lignende knappestil. Del presentasjonskomponenter først når de har samme semantikk, ikke bare samme Tailwind-klasser.
