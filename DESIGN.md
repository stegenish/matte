# Matteapp — Designdokument

Oppsummering av brainstorming-sesjon. Klar for tilbakemelding fra andre agenter/modeller.

---

## Kontekst

Matteapp for tre barn (7–11 år) med forskjellige behov:
- **Lily (yngst, ~7):** Grunnleggende trening — gjenkjenne flersifrede tall, tieroverganger, tiervenner
- **Lineus og Kian (eldre, ~9–11):** Mengdetrening på den lille gangetabellen

Mål: gjøre øving gøy og motiverende over lang tid.

---

## Beslutninger

### 1. Profiler
- Separate profiler per barn — egne poeng, titler og innstillinger
- **Pålogging:** Velg navn fra liste med avatar (emoji/figur), ingen passord
- Ingen barnenavn på vanskelighetsgrader — nivå er en konsekvens av hva de velger å øve på

### 2. Lagring
- **Nå:** localStorage
- **Fremtid:** Supabase med JSONB-kolonne (`id`, `navn`, `data JSONB`) — ingen skjema å vedlikeholde, innebygd auth klar når det trengs
- Datamodellen designes for enkel migrering (bytt localStorage-kall med ett API-kall)

**Datamodell per profil (MVP):**
```typescript
interface Profil {
  id: string
  navn: string
  avatar: string
  poeng: number           // totalt noensinne
  tittelIndex: number     // hvilken tittel+adjektiv nå
  sistInnstillinger: Innstillinger
  statistikk: {
    totaltRiktige: number
    totaltFeil: number
    høyesteStreak: number
    øvingstyperBrukt: string[]
  }
}
```

### 3. Titler og progresjon
- **Format:** Adjektiv + Tittel, f.eks. "Nølende Tallstarter" → "Modig Tallstarter" → "Ustoppelig Tallstarter" → "Nølende Plusshelt"
- **Antall:** ~4 adjektiv × ~15 titler = ~60 milepæler (lett å utvide)
- **Trigger:** Poengmilepæler
- Titler og adjektiv defineres i kode — morsomme/absurde norske mattematikk-tema à la Hades

### 4. Poeng og kombo-system
- **Basispoenget** (uendret fra nå): antall sifre i svaret + bonus for × (+5) og ÷ (+10)
- **Komboer:**
  - Streak (rette på rad): +1 per ekstra rett etter 3 på rad
  - Perfekt runde (alle rette, ingen feil): +20% av rundepoeng
  - Brukt 3+ forskjellige operasjoner i én runde: +10
  - Første gang en ny problemtype prøves: +5
- Tall kan justeres etter erfaring

### 5. Progresjon-UI
- **Under spilling:** Løpende poengsum og streakteller vises live
- **Ny tittel:** Stor feiring med animasjon (confetti, stor tekst) — som level-up i spill
- **Mellom runder:** Enkel oppsummering — poeng opptjent, streak, ny total

### 6. Øvingstyper
Profilen husker sist brukte innstillinger og foreslår riktig modus, men alt er justerbart.

#### a) Vanlige oppgaver (eksisterer i dag)
Dynamisk genererte oppgaver med valgbar operasjon, antall sifre og antall oppgaver.

#### b) Mønsterpakker (videreutvikling av Lily-fanen)
- **Konfigurasjon:** Startall + steg (f.eks. start 8, steg 2 → `8, 10, 12, …`)
- **Forhåndsdefinerte pakker** (definert i kode, ikke admin-UI):
  - Tiervenner (mangler for å komme til 10)
  - Dobling
  - +2 fra 8-tall (dagens Lily-pluss)
  - −1 fra tiere (dagens Lily-minus)
  - Hopp i 5-gangen
  - … (utvides programmatisk)
- **Egendefinert:** Bruker kan sette startall og steg selv

#### c) Tallgjenkjenning (for yngste)
To retninger som separate pakker:
- **Les tall:** Vis `47`, fire valgknapper — "trettisju / førtisju / syvogførti / sytten"
- **Skriv tall:** Vis "førtisju" som tekst, bruker skriver `47`
- Flervalg-UI (ikke input-felt) for "Les tall"-varianten

#### d) Gangetabell-drill
- Velg hvilke tabeller å øve på (avkrysningsbokser: 1–10)
- Oppgaver blandes tilfeldig fra valgte tabeller
- **Fremtidig:** Adaptiv logikk basert på per-stykke-statistikk (lagres i datamodellen fra start)

---

## Implementeringsrekkefølge

1. **Profilsystem** — localStorage, velg/opprett profil med avatar
2. **Poeng + titler + adjektiv** — milepæler, tittelfeiring
3. **Streak/kombo-system** — live under spilling
4. **Mønsterpakker** — konfigurerbar mønsterøvelse inkl. tallgjenkjenning
5. **Gangetabell-drill** — tabellvalg
6. **Supabase-migrering** — bytt localStorage med API-ruter

---

## Åpne spørsmål / ting å vurdere

- Hvilke konkrete titler og adjektiv skal brukes? (30–60 stk trengs)
- Bør per-stykke-statistikk for gangetabellen inn i MVP-datamodellen allerede nå?
- Skal "Les tall"-flervalg-UI bruke samme poenglogikk som vanlige oppgaver?
- Tieroverganger og tiervenner — er disse mønsterpakker, eller en egen øvingstype med annen UI?
- Avatar — emoji-velger eller fast sett med illustrasjoner?
