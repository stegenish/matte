// Adjektiv går i syklus innen hver tittel: når alle adjektiv er oppnådd,
// går man videre til neste tittel og starter på adjektiv[0] igjen.
export const ADJEKTIV = ["Nølende", "Modig", "Snedig", "Ustoppelig"] as const;

export const TITLER = [
  "Tellestarter",
  "Talltroll",
  "Sifferspeider",
  "Plusspilot",
  "Mattenisse",
  "Brøkjeger",
  "Trekantkriger",
  "Regnemester",
  "Tallhelt",
  "Gangekonge",
  "Mattemagiker",
  "Sifferalkymist",
  "Geometrigud",
  "Mattefjellets vokter",
  "Tallenes stormester",
] as const;

export const ANTALL_NIVÅER = ADJEKTIV.length * TITLER.length;
export const ANTALL_ETASJER = TITLER.length;

// Tårnet vokser med én etasje per nye tittel (hvert fjerde nivå),
// ikke hver gang adjektivet bytter. Dette gir mer betydningsfulle milepæler
// på den visuelle progresjonen.
export function tårnEtasjeForIndex(nivåIndex: number): number {
  const rå = Math.floor(Math.max(0, nivåIndex) / ADJEKTIV.length);
  return Math.min(rå, ANTALL_ETASJER - 1);
}

// Fun facts låses opp én per etasje. Etasje 0 er allerede synlig fra start.
export const FUN_FACTS = [
  "Velkommen til Mattetårnet! Hver gang du får ny tittel, vokser tårnet med én etasje.",
  "Tallet 0 ble oppfunnet i India for over tusen år siden.",
  "Matematikk er det eneste språket alle i verden forstår på samme måte.",
  "1 + 2 + 3 + ... + 100 = 5050. Carl Gauss regnet det ut da han var 8 år.",
  "Pi (π) har vi regnet ut til over 100 billioner desimaler — og det stopper aldri.",
  "Et minutt har 60 sekunder. Det kommer fra babylonerne for 4000 år siden!",
  "En sirkel har uendelig mange hjørner — eller ingen, avhengig av hvordan du teller.",
  "Tallet 7 er det mest populære «favoritt-tallet» i verden.",
  "Ordet «matematikk» kommer fra det greske ordet «máthēma» som betyr «det som læres».",
  "Et kvadrat med sider på 10 har et areal på 100. Et med sider på 100 har et areal på 10 000.",
  "Honningceller i et bikuberom har sekskanter — den mest effektive formen som finnes.",
  "Edderkoppene er ikke insekter. De har 8 bein, mens insekter har 6.",
  "Et sjakkbrett har 64 ruter. Hvis du dobler 1 ris-korn 64 ganger, får du flere korn enn det finnes på jorda.",
  "Det finnes uendelig mange primtall — det viste Euklid for over 2000 år siden.",
  "Mattefjellets toppmester regner med tall i søvne!",
] as const;

export interface Nivå {
  index: number;
  adjektiv: string;
  tittel: string;
  poengGrense: number;
}

// Poenggrenser:
// 0, 29, 45, 65, 87, 113, 142, 174, 209, 248, 290, ...
// Adjektiv-bytte hver ~30 poeng tidlig, tittel-bytte (4 nivåer) hver ~85+ poeng tidlig.
// Tunable — bare juster denne funksjonen.
export function poengGrenseForNivå(n: number): number {
  if (n <= 0) return 0;
  return Math.round(15 + 12 * n + 1.5 * n * n);
}

export function nivåForIndex(index: number): Nivå {
  const begrenset = Math.max(0, Math.min(index, ANTALL_NIVÅER - 1));
  const adjektivIndex = begrenset % ADJEKTIV.length;
  const tittelIndex = Math.floor(begrenset / ADJEKTIV.length);
  return {
    index: begrenset,
    adjektiv: ADJEKTIV[adjektivIndex],
    tittel: TITLER[tittelIndex],
    poengGrense: poengGrenseForNivå(begrenset),
  };
}

export function nivåForPoeng(poeng: number): Nivå {
  let funnet = 0;
  for (let i = 1; i < ANTALL_NIVÅER; i++) {
    if (poengGrenseForNivå(i) <= poeng) funnet = i;
    else break;
  }
  return nivåForIndex(funnet);
}
