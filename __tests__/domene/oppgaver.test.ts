import {
  tilfeldigMedSifre,
  lagOppgave,
  lagOppgaver,
  type Innstillinger,
} from "@/src/domene/oppgaver";

function antallSifre(n: number): number {
  return String(Math.abs(n)).length;
}

describe("tilfeldigMedSifre", () => {
  it.each([1, 2, 3, 4, 5])("genererer tall med nøyaktig %i sifre", (n) => {
    for (let i = 0; i < 100; i++) {
      const tall = tilfeldigMedSifre(n);
      expect(antallSifre(tall)).toBe(n);
    }
  });

  it("genererer tall i forventet område for n=1", () => {
    for (let i = 0; i < 100; i++) {
      const tall = tilfeldigMedSifre(1);
      expect(tall).toBeGreaterThanOrEqual(1);
      expect(tall).toBeLessThanOrEqual(9);
    }
  });

  it("genererer tall i forventet område for n=3", () => {
    for (let i = 0; i < 100; i++) {
      const tall = tilfeldigMedSifre(3);
      expect(tall).toBeGreaterThanOrEqual(100);
      expect(tall).toBeLessThanOrEqual(999);
    }
  });
});

describe("lagOppgave", () => {
  function basis(operasjon: "+" | "-" | "×" | "÷"): Innstillinger {
    return {
      sifrerA: 2,
      sifrerB: 1,
      operasjoner: [operasjon],
      antallOppgaver: 1,
    };
  }

  it("addisjon: svar = a + b", () => {
    for (let i = 0; i < 50; i++) {
      const o = lagOppgave(basis("+"));
      expect(o.operasjon).toBe("+");
      expect(o.svar).toBe(o.a + o.b);
    }
  });

  it("subtraksjon: svar = a - b og er aldri negativt", () => {
    for (let i = 0; i < 50; i++) {
      const o = lagOppgave(basis("-"));
      expect(o.operasjon).toBe("-");
      expect(o.svar).toBe(o.a - o.b);
      expect(o.svar).toBeGreaterThanOrEqual(0);
      expect(o.a).toBeGreaterThanOrEqual(o.b);
    }
  });

  it("multiplikasjon: svar = a * b", () => {
    for (let i = 0; i < 50; i++) {
      const o = lagOppgave(basis("×"));
      expect(o.operasjon).toBe("×");
      expect(o.svar).toBe(o.a * o.b);
    }
  });

  it("divisjon: svar er heltall og a = b * svar", () => {
    for (let i = 0; i < 50; i++) {
      const o = lagOppgave(basis("÷"));
      expect(o.operasjon).toBe("÷");
      expect(Number.isInteger(o.svar)).toBe(true);
      expect(o.a).toBe(o.b * o.svar);
    }
  });

  it("bruker tilfeldig en av operasjonene fra listen", () => {
    const innstillinger: Innstillinger = {
      sifrerA: 1,
      sifrerB: 1,
      operasjoner: ["+", "×"],
      antallOppgaver: 1,
    };
    const sett = new Set<string>();
    for (let i = 0; i < 100; i++) {
      sett.add(lagOppgave(innstillinger).operasjon);
    }
    expect(sett.has("+")).toBe(true);
    expect(sett.has("×")).toBe(true);
    expect(sett.has("-")).toBe(false);
    expect(sett.has("÷")).toBe(false);
  });

  // Dokumenterer kjent bug — divisjon ignorerer sifrerA, kvotienten er alltid 1–9.
  // Skal fikses i senere fase.
  it("KJENT BUG: divisjons-kvotient er alltid 1–9 uavhengig av sifrerA", () => {
    const innstillinger: Innstillinger = {
      sifrerA: 3,
      sifrerB: 1,
      operasjoner: ["÷"],
      antallOppgaver: 1,
    };
    for (let i = 0; i < 50; i++) {
      const o = lagOppgave(innstillinger);
      expect(o.svar).toBeGreaterThanOrEqual(1);
      expect(o.svar).toBeLessThanOrEqual(9);
    }
  });
});

describe("lagOppgaver", () => {
  it("genererer riktig antall oppgaver", () => {
    const oppgaver = lagOppgaver({
      sifrerA: 1,
      sifrerB: 1,
      operasjoner: ["+"],
      antallOppgaver: 7,
    });
    expect(oppgaver).toHaveLength(7);
  });

  it("hver oppgave er gyldig", () => {
    const oppgaver = lagOppgaver({
      sifrerA: 2,
      sifrerB: 1,
      operasjoner: ["+", "-", "×", "÷"],
      antallOppgaver: 20,
    });
    for (const o of oppgaver) {
      expect(o.svar).toBe(
        o.operasjon === "+"
          ? o.a + o.b
          : o.operasjon === "-"
          ? o.a - o.b
          : o.operasjon === "×"
          ? o.a * o.b
          : o.a / o.b,
      );
    }
  });
});
