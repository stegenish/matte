import {
  ADJEKTIV,
  TITLER,
  ANTALL_NIVÅER,
  ANTALL_ETASJER,
  FUN_FACTS,
  poengGrenseForNivå,
  nivåForIndex,
  nivåForPoeng,
  tårnEtasjeForIndex,
} from "@/src/domene/titler";

describe("titler-data", () => {
  it("har minst 4 adjektiv og 15 titler", () => {
    expect(ADJEKTIV.length).toBeGreaterThanOrEqual(4);
    expect(TITLER.length).toBeGreaterThanOrEqual(15);
    expect(ANTALL_NIVÅER).toBe(ADJEKTIV.length * TITLER.length);
  });
});

describe("poengGrenseForNivå", () => {
  it("nivå 0 krever 0 poeng", () => {
    expect(poengGrenseForNivå(0)).toBe(0);
  });

  it("er strengt voksende", () => {
    let forrige = -1;
    for (let i = 0; i < ANTALL_NIVÅER; i++) {
      const grense = poengGrenseForNivå(i);
      expect(grense).toBeGreaterThan(forrige);
      forrige = grense;
    }
  });

  it("returnerer 0 for negative input (defensivt)", () => {
    expect(poengGrenseForNivå(-5)).toBe(0);
  });
});

describe("nivåForIndex", () => {
  it("nivå 0 er første adjektiv + første tittel", () => {
    const n = nivåForIndex(0);
    expect(n.adjektiv).toBe(ADJEKTIV[0]);
    expect(n.tittel).toBe(TITLER[0]);
  });

  it("syklus av adjektiv innen samme tittel", () => {
    for (let i = 0; i < ADJEKTIV.length; i++) {
      expect(nivåForIndex(i).tittel).toBe(TITLER[0]);
    }
    // første nivå med ny tittel:
    expect(nivåForIndex(ADJEKTIV.length).tittel).toBe(TITLER[1]);
    expect(nivåForIndex(ADJEKTIV.length).adjektiv).toBe(ADJEKTIV[0]);
  });

  it("kapper på siste nivå hvis index er for stor", () => {
    const n = nivåForIndex(ANTALL_NIVÅER + 100);
    expect(n.index).toBe(ANTALL_NIVÅER - 1);
    expect(n.tittel).toBe(TITLER[TITLER.length - 1]);
  });

  it("kapper på 0 hvis index er negativ", () => {
    const n = nivåForIndex(-5);
    expect(n.index).toBe(0);
  });
});

describe("nivåForPoeng", () => {
  it("0 poeng = nivå 0", () => {
    expect(nivåForPoeng(0).index).toBe(0);
  });

  it("akkurat på grense gir nytt nivå", () => {
    const grense1 = poengGrenseForNivå(1);
    expect(nivåForPoeng(grense1).index).toBe(1);
  });

  it("rett under grense gir forrige nivå", () => {
    const grense1 = poengGrenseForNivå(1);
    expect(nivåForPoeng(grense1 - 1).index).toBe(0);
  });

  it("svært høyt poengsum kapper på siste nivå", () => {
    expect(nivåForPoeng(1_000_000).index).toBe(ANTALL_NIVÅER - 1);
  });

  it("plukker høyeste mulige nivå", () => {
    // Mellom nivå 5 og 6
    const grense5 = poengGrenseForNivå(5);
    const grense6 = poengGrenseForNivå(6);
    expect(nivåForPoeng(grense5).index).toBe(5);
    expect(nivåForPoeng(grense6 - 1).index).toBe(5);
    expect(nivåForPoeng(grense6).index).toBe(6);
  });
});

describe("tårnEtasjeForIndex", () => {
  it("etasje 0 dekker første tittel (alle adjektiv-syklus innen Tellestarter)", () => {
    for (let i = 0; i < ADJEKTIV.length; i++) {
      expect(tårnEtasjeForIndex(i)).toBe(0);
    }
  });

  it("etasje øker når tittelen bytter", () => {
    expect(tårnEtasjeForIndex(ADJEKTIV.length)).toBe(1);
    expect(tårnEtasjeForIndex(ADJEKTIV.length * 2)).toBe(2);
  });

  it("siste etasje matcher siste tittel", () => {
    expect(tårnEtasjeForIndex(ANTALL_NIVÅER - 1)).toBe(ANTALL_ETASJER - 1);
  });
});

describe("FUN_FACTS", () => {
  it("har minst én fakta per etasje", () => {
    expect(FUN_FACTS.length).toBeGreaterThanOrEqual(ANTALL_ETASJER);
  });
});
