# Matteapp — Designdokument v3

Tredje iterasjon. Konsoliderer:
- `DESIGN.md` (opprinnelig brainstorm)
- `DESIGN2.md` (peer-review fra Claude)
- `ChatGPT-design-feedback.md` (peer-review fra ChatGPT)

**Eksplisitt utelatt:**
- Adaptiv vanskelighetsgrad / skjult vanskelighetsstyring (vanskelig å få bra)
- Søskenkamp-modus
- Foreldrepanel
- Lyd i tallgjenkjenning (norsk TTS er for ujevnt for MVP)

---

## Kontekst

Matteapp for tre barn (7–11 år) med forskjellige behov:
- **Lily (yngst, ~7):** Grunnleggende — gjenkjenne flersifrede tall, tieroverganger, tiervenner
- **Lineus og Kian (eldre, ~9–11):** Mengdetrening på den lille gangetabellen

Mål: gjøre øving gøy og pedagogisk meningsfull over lang tid.

---

## Designprinsipper

1. **Ingen sammenligning mellom profiler** — beskytter motivasjonen til den yngste
2. **Streaks må være trygge** — skjold + per-runde gjør dem motiverende, ikke angstskapende
3. **Feil er læring** — strategi-kort, comeback-bonus, ingen straff
4. **Trening, ikke gambling** — bonusene styrer mot dybde, ikke mot å bytte rundt
5. **Spaced repetition fra dag 1** — datalagring er gratis, å miste data er dyrt
6. **Visuelt før symbolsk for yngste** — pedagogisk evidensbasert
7. **Variasjon innen samme fakta** — bygger ekte forståelse, ikke kun overflate-fluens
8. **Korte sesjoner** — 5 min daglig > 30 min ukentlig
9. **Synlig, konkret progresjon** — barn trenger å se det de bygger

---

## Beslutninger

### 1. Profiler
- Separate profiler per barn — egne poeng, titler, innstillinger og progresjon
- **Pålogging:** Velg navn fra liste med avatar, ingen passord
- Ingen sammenligning eller felles tavle på tvers av profiler
- Ingen barnenavn på vanskelighetsgrader

### 2. Avatar og tilbehør
- Fast sett med 10–15 emoji-avatarer å velge fra: 🦊 🐢 🦄 🐉 🦉 🐺 🦁 🐧 🦋 🐙 🦝 🐸 🐨
- **Tilbehør låses opp ved hver 5. tittel** — emoji-stacking ("🦊🎩")
- Tilbehør har gjerne tematisk betydning: "Tellermesterens hatt", "Regnemesterens briller"

### 3. Lagring
- **Nå:** localStorage
- **Fremtid:** Supabase med JSONB-kolonne — minimal skjema, innebygd auth klar
- Datamodellen designes for enkel migrering

**Datamodell per profil (MVP):**
```typescript
interface Profil {
  id: string
  navn: string
  avatar: string
  tilbehør: string[]
  poeng: number
  tittelIndex: number
  tårnEtasje: number              // se §10 — visuell makro-progresjon
  sistInnstillinger: Innstillinger
  faktaStatus: FaktaStatus[]      // per-stykke for fremtidig bruk
  statistikk: {
    totaltRiktige: number
    totaltFeil: number
    høyesteStreak: number
    øvingstyperBrukt: string[]
    sisteSesjoner: SesjonOppsummering[]
  }
  dagligUtfordringSistGjort: ISO-dato
  funFactsSamlet: string[]        // se §10
}
```

### 4. Titler og progresjon
- **Format:** Adjektiv + Tittel — "Forvirret Tellefant" → "Snedig Tellefant" → "Ustoppelig Tellefant" → "Forvirret Talltroll"
- **Antall:** ~4 adjektiv × ~15 titler = ~60 milepæler
- **Trigger:** Poengmilepæler
- Defineres i `titler.ts` — humor + nordisk fjell-/trolltema (eksempler: Tellefant, Talltroll, Regnemester, Mattemagiker, Plusspilot)

### 5. Visuell makro-progresjon — Mattetårnet
**Konkret bygg-metafor på toppen av titler.**

- Hver profil har sitt eget **mattemagiker-tårn**
- Hver tittel-milepæl = ny etasje låst opp
- SVG-illustrasjon med ~15 etasjer som vokser oppover
- Hver etasje kan ha en liten **fun fact** som låses opp ("Visste du at 0 ble oppfunnet i India?")
- Synlig på profilforsiden — viser ikke poengsum direkte, men hvor høyt tårnet er

**Implementeringsmessig:** én SVG-fil med lag, hver lag synliggjøres når `tårnEtasje >= n`.

### 6. Poeng
**Designprinsipp:** Antall riktige svar per nivå skal være jevnt på tvers av operasjoner.

- **Basispoenget:** antall sifre i svaret
- **Vanskelighetsbonus** (erstatter operasjonsbonus):
  - Tieroverganger: +1
  - Tresifrede svar: +1
  - × +1, ÷ +2 (ned fra +5/+10)
- **Visualisert** med stjerner ved siden av tallet: "+3 ⭐⭐⭐"
- For tallgjenkjenning (flervalg): basispoenget = 1, ingen sifferbonus

### 7. Streak og kombo
- **Streak (rette på rad):** +1 per ekstra rett etter 3 på rad — *kun innen runde*
- **Skjold:** du tåler 1 feil før streak'en brytes (synlig 🛡)
- **Comeback:** 3 feil på rad fulgt av en rett: +10, "Du ga ikke opp! 💪"
- **Perfekt runde:** +20% av rundepoeng
- **Første gang en ny problemtype:** +5
- **Live mikro-feedback** per oppgave: "Riktig! +3 ⭐⭐⭐", "Streak ×5! 🔥"

*Bonus for "3+ operasjoner i én runde" er fjernet — styrer adferd vekk fra mengdetrening.*

### 8. Variasjon innen samme fakta (ChatGPT-bidrag)
**Mengdetrening blandes opp med fire varianter av samme stykke:**

| Format | Eksempel |
|---|---|
| Klassisk | `6 × 7 = ?` |
| Manglende faktor | `? × 7 = 42` |
| Omvendt operasjon | `42 ÷ 7 = ?` |
| Sant eller usant | `8 × 7 = 54 — riktig eller feil?` |

**Bruk:** Gangetabell-drill og mønsterpakker bytter spontant mellom variantene. Trener faktisk forståelse av relasjonen 7×8 = 56 ↔ 56÷7 = 8 ↔ 8×?=56.

**Implementering:** Generatoren produserer base-fakta (`{a: 7, b: 8, svar: 56}`), så velger en presentasjonsvariant tilfeldig. Same fakta-objekt, ulik UI.

### 9. Karakter / maskot
- En liten figur (knyttet til profilens avatar) dukker opp og kommenterer
- Korte, varierte tekstbobler:
  - Ved riktig: "Dette var lett!" / "Du knuste den!" / "Kjapt!"
  - Ved feil: "Nesten!" / "Prøv en gang til, du klarer det"
  - Ved tittelopprykk: "Wow, ny tittel! 🎉"
- Lavt kostnad, høy sjarm
- Tekstutvalg defineres i kode — kan utvides over tid

### 10. Strategi-kort ved feil og før nye oppgavetyper
**Reaktiv** ved feil:
- For tieroverganger: dekomponering
  ```
  7 + 8 = ?
  ↓ del 8 i 3 + 5
  7 + 3 = 10, så 10 + 5 = 15
  ```
- For gangetabellen: distributiv strategi
  ```
  7 × 8 = ?
  ↓ 7 × 4 = 28, så 28 + 28 = 56
  ```
- ChatGPTs eksempel: ved 8×7=54 (feil), respons: "8 × 5 = 40, og 2 × 8 = 16 → hva blir summen?"

**Proaktiv** første gang en ny oppgavetype dukker opp:
- Vis strategi-kortet *før* første oppgave: "Slik tenker du på 8+5..."
- Lagres som "vist" i profil — ikke vist igjen ved samme oppgavetype

### 11. Visuell representasjon for yngste
- **Ten-frame** for tiervenner og tieroverganger
- **Tallinje** for hopping i 2-er, 5-er, 10-er
- **Prikkmønster** for små tall
- **Plassverdi-visualisering** for tallgjenkjenning: `47` → ▮▮▮▮ (4 tiere) + ▫▫▫▫▫▫▫ (7 enere)
- Implementeres som enkle SVG-elementer
- Kan slås av/på når barnet ikke trenger det

### 12. Sesjonsstruktur
- **Anbefalt sesjon: ~5 minutter**
- **Daglig varm-opp:** første runde litt lettere enn nivået
- **"Ferdig for i dag!"-skjerm** etter ~5 min med oppsummering
- **Ingen straff** for dager man ikke spiller
- **"Velkommen tilbake!"-bonus** når man kommer tilbake etter pause

### 13. Progresjon-UI
- **Under spilling:** Live poengsum med stjerner, streakteller (med skjold), mikro-feedback per oppgave
- **Tittelopprykk:** Stor feiring med animasjon (confetti, stor tekst), maskot kommenterer
- **Mellom runder:** Oppsummering — poeng opptjent, streak, tårnetasje (hvis ny)
- **Tittelvisning:** Alltid synlig — "Snedig Tellefant 🦊🎩"
- **Tårnvisning:** På profilforsiden, kan trykkes på for å se etasjer + fun facts

### 14. Lyd
- Korte, milde lyder ved riktig/feil/tittelopprykk
- Mute-knapp lett tilgjengelig per profil
- *Ingen* lyd-opplesning av tall (norsk TTS er for ujevnt for MVP)

### 15. Per-stykke-statistikk
Lagres fra dag 1, selv uten adaptiv logikk i bruk:

```typescript
interface FaktaStatus {
  oppgaveNøkkel: string      // "7×8"
  rette: number
  feile: number
  sistVist: ISO-dato
}
```

**Hva data brukes til i MVP:**
- Vise statistikk visuelt for forelder (ikke et helt panel — bare en enkel oversikt)
- Brukes til "Daglig utfordring" (§19) — velg fakta med flest feil

**Ikke i MVP, men muligens senere:** vekting i drill, full SM-2.

---

## Øvingstyper

Profilen husker sist brukte innstillinger. Alt er justerbart.

### a) Vanlige oppgaver
Dynamisk genererte oppgaver med valgbar operasjon, antall sifre og antall.

### b) Mønsterpakker
- **Forhåndsdefinerte pakker** (i kode):
  - Tiervenner
  - Dobling
  - +2 fra 8-tall
  - −1 fra tiere
  - Hopp i 5-gangen
  - Tieroverganger (8+5, 7+6, 9+4 …)
  - Halvering
- **Egendefinert:** Bruker setter startall + steg
- **Ten-frame-visualisering** kan slås på

### c) Tallgjenkjenning
- **Les tall:** `47` → flervalg "trettisju / førtisju / syvogførti / sytten"
- **Skriv tall:** "førtisju" → bruker skriver `47`
- **Plassverdi-visualisering** kan slås på
- Egen poenglogikk (lavere — flervalg er enklere)

### d) Tieroverganger / tiervenner som egne typer
Egne typer med automatisk ten-frame-visualisering, ikke bare mønstervariant.
Trolig viktigste øvingstyper for Lily.

### e) Gangetabell-drill
- Velg tabeller (1–10)
- Stykker blandes tilfeldig
- **Variasjon i format** (§8): klassisk, manglende faktor, omvendt, sant/usant
- Per-stykke-statistikk lagres

### f) Lyn-runde
- 60 sekunder, så mange stykker du klarer
- Egen rekord per profil
- Kan velges per øvingstype (gangetabell, pluss, mønsterpakke)
- Bonuspoeng for ny rekord

### g) Boss-kamp
- Dukker opp etter X riktige i en sesjon (variabel — ikke alltid)
- "Mattetrollet utfordrer deg!" — én stor, kuratert oppgave med mer poeng
- Visuell figur, dramatisk innramming

### h) Daglig utfordring
- 3–5 oppgaver kuratert fra det barnet sliter mest med (basert på `faktaStatus`)
- Synlig på startsiden
- Gir bonuspoeng + en fun fact til tårnet
- Bygger vane uten tvang

---

## Implementeringsrekkefølge

1. **Profilsystem** — localStorage, velg/opprett profil med avatar
2. **Datamodell inkl. `faktaStatus`** og `tårnEtasje`
3. **Poeng + titler + adjektiv + visualiserte stjerner** — milepæler, tittelfeiring, tilbehør
4. **Mattetårnet** — SVG med etasjer som låses opp
5. **Streak/kombo med skjold + comeback** — live mikro-feedback
6. **Karakter/maskot** — kommentarer ved hendelser
7. **Mønsterpakker inkl. tieroverganger og tallgjenkjenning**
8. **Visuell representasjon (ten-frame, tallinje, prikkmønster, plassverdi)**
9. **Strategi-kort ved feil og proaktivt**
10. **Gangetabell-drill med format-variasjon (§8)**
11. **Tieroverganger/tiervenner som egne øvingstyper**
12. **Lyn-runde**
13. **Boss-kamp**
14. **Daglig utfordring**
15. **Lyd med per-profil mute**
16. **Sesjonstaking + "Velkommen tilbake!"-bonus**
17. **Supabase-migrering**

---

## Åpne spørsmål

- **Konkrete titler og adjektiv** — trenger ~60 forslag i `titler.ts`. Eget brainstorm-pass.
- **Tilbehør-emoji-liste** — 12 stk å låse opp. Eget brainstorm-pass.
- **Maskot-kommentarer** — bibliotek av 30–50 korte tekster fordelt på situasjoner.
- **Mattetårnet** — én SVG-illustrasjon å designe / få tegnet.
- **Fun facts** — ~15 norske matte-relaterte fakta egnet for barn.
- **Strategi-kort** — hvilke pedagogiske strategier dekker vi først? (tieroverganger og 7×8 er åpenbare; flere?)
- **Lyd-bibliotek** — egenproduserte korte lyder eller fri-brukbare?
- **Validering** — bør designet sjekkes med en mattepedagog før mye er bygget?
