import {
  fasitFor,
  lagGangeOppgave,
  lagGangerunde,
  poengForGangeOppgave,
} from "@/src/domene/gangevariant";

describe("lagGangeOppgave", () => {
  it("klassisk: produkt = a * b", () => {
    const o = lagGangeOppgave(7, 8, "klassisk");
    expect(o.variant).toBe("klassisk");
    expect(o.produkt).toBe(56);
    expect(fasitFor(o)).toBe(56);
  });

  it("manglende-faktor: setter manglerSide", () => {
    const o = lagGangeOppgave(7, 8, "manglende-faktor", () => 0.7); // > 0.5 → 'a'
    expect(o.manglerSide).toBe("a");
    expect(fasitFor(o)).toBe(7);
  });

  it("manglende-faktor: random < 0.5 gir manglerSide=b", () => {
    const o = lagGangeOppgave(7, 8, "manglende-faktor", () => 0.1);
    expect(o.manglerSide).toBe("b");
    expect(fasitFor(o)).toBe(8);
  });

  it("omvendt: fasit er a (gitt produkt og b)", () => {
    const o = lagGangeOppgave(7, 8, "omvendt");
    expect(o.produkt).toBe(56);
    expect(fasitFor(o)).toBe(7);
  });

  it("sant-usant: random > 0.5 gir riktig påstand", () => {
    const o = lagGangeOppgave(7, 8, "sant-usant", () => 0.9);
    expect(o.påstand).toBe(56);
    expect(o.påstandRiktig).toBe(true);
    expect(fasitFor(o)).toBe(1);
  });

  it("sant-usant: random < 0.5 gir feil påstand", () => {
    // Bruk en deterministisk random som velger en spesifikk offset
    let count = 0;
    const random = () => {
      count++;
      if (count === 1) return 0.1; // skalVæreSant = false
      return 0.5; // velg midt-offset
    };
    const o = lagGangeOppgave(7, 8, "sant-usant", random);
    expect(o.påstandRiktig).toBe(false);
    expect(o.påstand).not.toBe(56);
    expect(fasitFor(o)).toBe(0);
  });

  it("sant-usant: påstand er aldri identisk med produkt når skalVæreSant=false", () => {
    for (let i = 0; i < 100; i++) {
      const o = lagGangeOppgave(7, 8, "sant-usant", () => Math.random());
      if (!o.påstandRiktig) {
        expect(o.påstand).not.toBe(o.produkt);
      }
    }
  });
});

describe("lagGangerunde", () => {
  it("genererer riktig antall oppgaver", () => {
    const oppgaver = lagGangerunde({
      tabeller: [2, 5],
      varianter: ["klassisk"],
      antallOppgaver: 7,
    });
    expect(oppgaver).toHaveLength(7);
  });

  it("alle a-er er fra valgte tabeller", () => {
    const oppgaver = lagGangerunde({
      tabeller: [3, 7],
      varianter: ["klassisk"],
      antallOppgaver: 50,
    });
    for (const o of oppgaver) {
      expect([3, 7]).toContain(o.a);
    }
  });

  it("returnerer tom liste når tabeller eller varianter er tom", () => {
    expect(
      lagGangerunde({ tabeller: [], varianter: ["klassisk"], antallOppgaver: 5 }),
    ).toHaveLength(0);
    expect(
      lagGangerunde({ tabeller: [2], varianter: [], antallOppgaver: 5 }),
    ).toHaveLength(0);
  });

  it("blander varianter når flere er valgt", () => {
    const oppgaver = lagGangerunde({
      tabeller: [2, 5, 7],
      varianter: ["klassisk", "manglende-faktor", "omvendt", "sant-usant"],
      antallOppgaver: 100,
    });
    const variantSett = new Set(oppgaver.map((o) => o.variant));
    expect(variantSett.size).toBeGreaterThan(1);
  });
});

describe("poengForGangeOppgave", () => {
  it("sant-usant gir 1 poeng", () => {
    expect(
      poengForGangeOppgave(lagGangeOppgave(7, 8, "sant-usant", () => 0.9)),
    ).toBe(1);
  });

  it("klassisk: sifre i produkt + 1 (×-bonus)", () => {
    expect(poengForGangeOppgave(lagGangeOppgave(7, 8, "klassisk"))).toBe(2 + 1);
    expect(poengForGangeOppgave(lagGangeOppgave(2, 3, "klassisk"))).toBe(1 + 1);
  });

  it("manglende-faktor og omvendt scorer som klassisk", () => {
    expect(
      poengForGangeOppgave(lagGangeOppgave(7, 8, "manglende-faktor")),
    ).toBe(2 + 1);
    expect(poengForGangeOppgave(lagGangeOppgave(7, 8, "omvendt"))).toBe(2 + 1);
  });
});
