# Matteapp — Designdokument v2

Andre iterasjon. Bygger på `DESIGN.md` med tilføyelser etter pedagogisk peer-review. Søskenkamp-modus og foreldrepanel er bevisst utelatt.

---

## Kontekst

Matteapp for tre barn (7–11 år) med forskjellige behov:
- **Lily (yngst, ~7):** Grunnleggende trening — gjenkjenne flersifrede tall, tieroverganger, tiervenner
- **Lineus og Kian (eldre, ~9–11):** Mengdetrening på den lille gangetabellen

Mål: gjøre øving gøy og motiverende over lang tid, med pedagogisk fundert progresjon.

---

## Beslutninger

### 1. Profiler
- Separate profiler per barn — egne poeng, titler og innstillinger
- **Pålogging:** Velg navn fra liste med avatar, ingen passord
- Ingen sammenligning eller felles tavle på tvers av profiler — aldersforskjell ville knust motivasjonen
- Ingen barnenavn på vanskelighetsgrader — nivå er en konsekvens av hva de velger å øve på

### 2. Avatar
- Fast sett med 10–15 emojier som start: 🦊 🐢 🦄 🐉 🦉 🐺 🦁 🐧 🦋 🐙 🦝 🐸 🐨
- **Tilbehør låses opp ved hver 5. tittel** — hatt, briller, kappe (emoji-stacking, f.eks. "🦊🎩")
- Lett å utvide senere

### 3. Lagring
- **Nå:** localStorage
- **Fremtid:** Supabase med JSONB-kolonne (`id`, `navn`, `data JSONB`) — ingen skjema å vedlikeholde, innebygd auth klar
- Datamodellen designes for enkel migrering (bytt localStorage-kall med ett API-kall)

**Datamodell per profil (MVP):**
```typescript
interface Profil {
  id: string
  navn: string
  avatar: string             // emoji-id
  tilbehør: string[]         // låste opp emojier å stable
  poeng: number              // totalt noensinne
  tittelIndex: number        // hvilken tittel+adjektiv nå
  sistInnstillinger: Innstillinger
  faktaStatus: FaktaStatus[]   // per-stykke for spaced repetition (se §6)
  statistikk: {
    totaltRiktige: number
    totaltFeil: number
    høyesteStreak: number
    øvingstyperBrukt: string[]
    sisteSesjoner: SesjonOppsummering[]   // siste 30 dager
  }
  dagligUtfordringSistGjort: ISO-dato
}
```

### 4. Titler og progresjon
- **Format:** Adjektiv + Tittel, f.eks. "Nølende Tallstarter" → "Modig Tallstarter" → "Ustoppelig Tallstarter" → "Nølende Plusshelt"
- **Antall:** ~4 adjektiv × ~15 titler = ~60 milepæler (lett å utvide)
- **Trigger:** Poengmilepæler
- Titler defineres i kode i en egen `titler.ts` — nordisk fjell-/trolltema med plass for absurde innslag à la Hades

### 5. Poeng og kombo-system
**Designprinsipp:** Antall riktige svar per nivå skal være likt på tvers av operasjoner. Poeng skal reflektere *hvor utfordrende oppgaven er for denne brukeren*, ikke hvilken operasjon det er.

- **Basispoenget:** antall sifre i svaret
- **Vanskelighetsbonus** (erstatter operasjonsbonus):
  - Tieroverganger: +1
  - Tresifrede svar: +1
  - Gangetabell-stykke som er klassifisert som "vanskelig" for denne profilen (basert på `faktaStatus`): +2
  - Operasjonsbonus reduseres: × +1, ÷ +2 (ned fra +5/+10)

- **Komboer:**
  - **Streak (rette på rad):** +1 per ekstra rett etter 3 på rad — *kun innen runde*, ikke på tvers
  - **Skjold:** du tåler 1 feil før streak'en brytes (synlig "🛡 1" som forsvinner ved feil)
  - **Comeback:** 3 feil på rad etterfulgt av en rett: +10, "Du ga ikke opp! 💪"
  - **Perfekt runde** (alle rette, ingen feil): +20% av rundepoeng
  - **Første gang en ny problemtype prøves:** +5

  *Bonus for "3+ operasjoner i samme runde" er fjernet — det styrer adferd vekk fra mengdetrening.*

- Tall justeres etter erfaring

### 6. Spaced repetition (per-stykke-statistikk)

For gangetabellen (og evt. andre faktakunnskaper) lagres per oppgave:

```typescript
interface FaktaStatus {
  oppgaveNøkkel: string      // "7×8"
  rette: number
  feile: number
  sistVist: ISO-dato
  intervallDager: number     // Leitner-aktig: 1, 2, 4, 7, 14, 30
  vanskelighet: number       // 0–1, høy = vises ofte
}
```

**MVP-bruk:**
- Lagre dataene fra dag 1
- Enkleste regel: stykker med flere feil enn rette vises 2× så ofte
- Full SM-2 / Leitner kommer senere uten datamigrering

### 7. Feedback ved feil
"Prøv igjen" alene er svakt. Når en oppgave svares feil:

- **For tieroverganger:** vis dekomponering
  ```
  7 + 8 = ?
  ↓ del 8 i 3 + 5
  7 + 3 = 10, så 10 + 5 = 15
  ```
- **For gangetabellen:** vis distributiv strategi
  ```
  7 × 8 = ?
  ↓ 7 × 4 = 28, så 28 + 28 = 56
  ```
- For andre operasjoner: vis svaret tydelig før neste forsøk
- Bygges som egne små "strategi-kort" pr. oppgavetype

### 8. Visuell representasjon for yngste
For Lily er rent symbolsk matte (`8 + 5 = ?`) en abstraksjon hun ikke nødvendigvis har internalisert.

- **Ten-frame** (rute med 10 prikker) for tiervenner og tieroverganger
- **Tallinje** for hopping i 2-er, 5-er, 10-er
- **Prikkmønster** for tallgjenkjenning

Implementasjon: enkle SVG-rektangler/sirkler — ikke fancy. Visuelt-først, symbolsk-etterpå er sterkt forskningsstøttet for 6–8-årsalderen. Kan slås av når barnet ikke trenger det lenger.

### 9. Auto-justering av vanskelighet
- ≥90% rett over siste 20 problemer → **foreslå** hardere nivå med popup
- ≤50% rett → **foreslå** lettere nivå med popup
- Aldri tving — barnet velger selv. "Vil du prøve litt vanskeligere?"

### 10. Sesjonsstruktur
- **Anbefalt sesjon: ~5 minutter** (forskning: 5–10 min daglig slår 30 min ukentlig)
- **Daglig varm-opp:** første runde er litt lettere enn nivået, for å bygge fart
- **"Ferdig for i dag!"-skjerm** etter ~5 min med oppsummering
- **Ingen straff** for dager man ikke spiller (motsatt av Duolingo-streak — hindrer angst)
- Liten **"velkommen tilbake"-bonus** når man kommer tilbake etter pause

### 11. Progresjon-UI
- **Under spilling:** Løpende poengsum, streakteller (med skjold-ikon), live oppdatering
- **Ny tittel:** Stor feiring med animasjon (confetti, stor tekst) — som level-up i spill
- **Mellom runder:** Enkel oppsummering — poeng opptjent, streak, ny total
- **Tittelvisning:** Alltid synlig nederst/topp i appen — "Modig Plusshelt 🦊🎩"

### 12. Lyd
- Korte, milde lyder ved riktig/feil/tittelopprykk
- **Mute-knapp lett tilgjengelig** for kveldsbruk
- Lagres per profil (Lily kan ha lyd, Kian kan ha mutet)

---

## Øvingstyper

Profilen husker sist brukte innstillinger og foreslår riktig modus, men alt er justerbart.

### a) Vanlige oppgaver (eksisterer i dag)
Dynamisk genererte oppgaver med valgbar operasjon, antall sifre og antall oppgaver.

### b) Mønsterpakker (videreutvikling av Lily-fanen)
- **Konfigurasjon:** Startall + steg (f.eks. start 8, steg 2 → `8, 10, 12, …`)
- **Forhåndsdefinerte pakker** (definert i kode):
  - Tiervenner (mangler for å komme til 10)
  - Dobling
  - +2 fra 8-tall (dagens Lily-pluss)
  - −1 fra tiere (dagens Lily-minus)
  - Hopp i 5-gangen
  - Tieroverganger (8+5, 7+6, 9+4 …)
  - Halvering
  - … (utvides programmatisk)
- **Egendefinert:** Bruker kan sette startall og steg selv
- **Ten-frame-visualisering** kan slås på for relevante pakker

### c) Tallgjenkjenning (for yngste)
To retninger som separate pakker:
- **Les tall:** Vis `47`, fire valgknapper — "trettisju / førtisju / syvogførti / sytten" (flervalg)
- **Skriv tall:** Vis "førtisju" som tekst, bruker skriver `47`
- **Egen poenglogikk:** flervalg er enklere → basispoenget = 1 uten sifferbonus
- **Prikkmønster-visualisering** kan slås på for laveste nivå

### d) Gangetabell-drill
- Velg hvilke tabeller å øve på (avkrysningsbokser: 1–10)
- Stykker blandes — først tilfeldig, så vektet av `faktaStatus` (vanskelige stykker oftere)
- Per-stykke-statistikk lagres fra start

### e) Lyn-runde (gangetabellen)
- 60 sekunder, så mange stykker du klarer
- Egen rekord per profil
- Trener automatikk gjennom tidspress
- Bonuspoeng for ny rekord

### f) Boss-kamp
- Dukker opp etter X riktige i en sesjon (ikke alltid — variabel belønning)
- "Mattetrollet utfordrer deg!" — én stor, kuratert oppgave med mer poeng
- Visuell figur, dramatisk innramming

### g) Daglig utfordring
- 3–5 oppgaver kuratert fra det barnet sliter mest med (basert på `faktaStatus`)
- Synlig på startsiden
- Gir bonuspoeng, ikke obligatorisk
- Bygger vane uten tvang

---

## Implementeringsrekkefølge

1. **Profilsystem** — localStorage, velg/opprett profil med avatar
2. **Datamodell inkludert `faktaStatus`** — selv om logikken er enkel i starten
3. **Poeng + titler + adjektiv** — milepæler, tittelfeiring, tilbehør på avatar
4. **Streak/kombo-system med skjold + comeback** — live under spilling
5. **Mønsterpakker inkl. tieroverganger og tallgjenkjenning**
6. **Visuell representasjon (ten-frame, tallinje, prikkmønster)** — kan slås av/på
7. **Strategi-kort ved feil** — dekomponering for tieroverganger og gangetabell
8. **Gangetabell-drill med vekting fra `faktaStatus`**
9. **Lyn-runde**
10. **Boss-kamp**
11. **Daglig utfordring**
12. **Auto-justering av vanskelighet (foreslå-popup)**
13. **Lyd med per-profil mute**
14. **Sesjonstaking (~5 min) med "ferdig for i dag!"-skjerm**
15. **Supabase-migrering** — bytt localStorage med API-ruter

---

## Designprinsipper (oppsummert)

1. **Ingen sammenligning mellom profiler** — beskytter motivasjonen til den yngste
2. **Streaks må være trygge** — skjold + per-runde gjør dem motiverende, ikke angstskapende
3. **Feil er læring** — strategi-kort, comeback-bonus, ingen straff
4. **Trening, ikke gambling** — bonusene styrer mot dybde, ikke mot å bytte rundt
5. **Spaced repetition fra dag 1** — datalagring er gratis, å miste data er dyrt
6. **Visuelt før symbolsk for yngste** — pedagogisk evidensbasert
7. **Foreslå, ikke tving** — vanskelighetsjustering er en invitasjon, ikke en regel
8. **Korte sesjoner** — 5 min daglig > 30 min ukentlig

---

## Åpne spørsmål

- **Konkrete titler og adjektiv** — trenger ~60 forslag i `titler.ts`. Foreslår eget brainstorm-pass.
- **Tilbehør-emoji-liste** — 12 stk å låse opp gjennom progresjon. Foreslår eget brainstorm-pass.
- **Pedagogisk innspill fra ekspert** — bør valideres mot faglærer / mattepedagog før mye er bygget?
- **Hvilke strategi-kort først?** — tieroverganger og 7×8/8×7 er åpenbare, men hvilke flere?
- **Lyd-bibliotek** — egenproduserte korte lyder, eller fri-brukbare bibliotek?
