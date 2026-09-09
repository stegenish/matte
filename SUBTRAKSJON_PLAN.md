# Subtraksjonsfane — plan og arbeidslogg

## Mål

Lag en ny fane som bygger konkret forståelse av `A − B = C` ved at barnet:

1. legger `A` baller i et rutenett;
2. krysser ut `B` av ballene;
3. skriver hvor mange som er igjen;
4. ser sammenhengen `A − B = C` og `B + C = A`.

Alle genererte oppgaver skal ha `A >= B`, og eksempelmodus skal aldri gi poeng.

## Avklarte designvalg

- Vanlig modus bruker én oppgave om gangen og vanskelighetsvalg «opp til 10» / «opp til 20».
- Barnet klikker tomme ruter for å legge til baller og klikker baller for å krysse dem ut.
- Tellere og spørsmål bruker ordene «Hvor mange har jeg?», «Hvor mange tar jeg bort?» og «Hvor mange har jeg igjen?».
- Den symmetriske addisjonen viser `B + ? = A` før svaret er kontrollert og `B + C = A` etter riktig svar.
- Eksempelmodus bruker små tall, animerer en egen musepeker over rutenettet og kan startes på nytt når som helst.
- Nytt eksempel oppretter en egen runde uten å bruke svar-, statistikk- eller poengorkestrering.

## Plan

- [x] Skriv domenetester for gyldige subtraksjonsoppgaver og visuell tilstand.
- [x] Implementer `src/domene/subtraksjon.ts` med deterministisk generatorstøtte.
- [x] Skriv komponenttester for legg-til, kryss-ut, svar og poeng.
- [x] Implementer interaktivt ballerutenett og inverse ligninger.
- [x] Skriv test for eksempelmodus uten poeng.
- [x] Implementer animert eksempel med knapp for nytt eksempel.
- [x] Legg fanen inn i `app/oppgaver/page.tsx` og oppdater agentoversikten.
- [x] Kjør fokuserte tester og la en subagent gjennomgå konseptet.
- [x] Kjør full test, TypeScript, lint og build.
- [x] Commit med brukerprompten i commit-meldingen og push.

## Arbeidslogg

- 2026-09-09: Plan opprettet. Ingen produksjonskode eller tester er endret ennå.
- 2026-09-09: Tre domenetester skrevet rødt og deretter implementert. Generatoren garanterer `A >= B`, og en ren ballmodell eier fasene legg til, ta bort og svar.
- 2026-09-09: To komponenttester skrevet rødt og deretter implementert. Den interaktive flyten, skjult inversfasit, eksempelanimasjon og poengfri eksempelmodus er på plass.
- 2026-09-09: Alle fem fokuserte tester passerer. Fanen er koblet inn, mobilbredden er strammet inn, agentoversikten er oppdatert, og fersk-kontekst-gjennomgang er startet.
- 2026-09-09: Gjennomgangen fant mobilbredde, misvisende klikketiketter, duplisert eksempelmodell og hardkodet pekerplassering. Rettelsene er testdrevet: rutenettet fungerer ved 320 px, bare gyldige ballhandlinger er aktive, eksempelmodus bruker domenets overganger, og pekeren ligger i aktuell rute uten pikselkobling. Integrasjonstest beskytter engangspoeng og flere poengfrie eksempler. Sju fokuserte tester passerer.
- 2026-09-09: Sluttgjennomgangen fant at et uendret feil svar kunne registreres flere ganger, og at valgte innstillinger bare var markert med farge. En regresjonstest feilet først; nå låses samme svar til barnet redigerer det, og modus/vanskelighet eksponerer `aria-pressed`. De sju fokuserte testene passerer fortsatt.
- 2026-09-09: Sluttverifisering bestått: 24 testsuiter / 233 tester, TypeScript, ESLint og produksjonsbuild. Build viser kun den eksisterende advarselen om flere lockfiler.
