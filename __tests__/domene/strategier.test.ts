import { strategiForOppgave } from "@/src/domene/strategier";
import type { Oppgave } from "@/src/domene/typer";

function lag(a: number, b: number, op: Oppgave["operasjon"]): Oppgave {
  const svar =
    op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b;
  return { a, b, operasjon: op, svar };
}

describe("strategiForOppgave", () => {
  it("returnerer tier-pluss-strategi for tieroverganger", () => {
    const s = strategiForOppgave(lag(7, 8, "+"));
    expect(s?.id).toBe("tier-pluss");
    // Forventet steg: 7+8, del 8 i 3+5, 7+3=10, 10+5=15
    expect(s?.steg).toEqual([
      "7 + 8 = ?",
      "Del 8 i 3 + 5",
      "7 + 3 = 10",
      "10 + 5 = 15",
    ]);
  });

  it("ingen tier-pluss-strategi når enerne ikke krysser 10", () => {
    expect(strategiForOppgave(lag(2, 3, "+"))).toBeNull();
    expect(strategiForOppgave(lag(20, 5, "+"))).toBeNull();
  });

  it("returnerer tier-minus-strategi for borrow", () => {
    const s = strategiForOppgave(lag(12, 5, "-"));
    expect(s?.id).toBe("tier-minus");
    // Forventet: 12-5, del 5 i 2+3, 12-2=10, 10-3=7
    expect(s?.steg).toEqual([
      "12 − 5 = ?",
      "Del 5 i 2 + 3",
      "12 − 2 = 10",
      "10 − 3 = 7",
    ]);
  });

  it("ingen tier-minus-strategi uten borrow", () => {
    expect(strategiForOppgave(lag(28, 5, "-"))).toBeNull();
    expect(strategiForOppgave(lag(50, 30, "-"))).toBeNull();
  });

  it("returnerer distributiv-strategi for ganging av to-sifrede faktorer", () => {
    const s = strategiForOppgave(lag(7, 8, "×"));
    expect(s?.id).toBe("distributiv-gang");
    // Forventet: del 8 i 4+4, 7×4=28, 28+28=56
    expect(s?.steg).toEqual([
      "7 × 8 = ?",
      "Del 8 i 4 + 4",
      "7 × 4 = 28",
      "7 × 4 = 28",
      "28 + 28 = 56",
    ]);
  });

  it("distributiv-strategi for ulike faktorer (oddetall)", () => {
    const s = strategiForOppgave(lag(6, 7, "×"));
    expect(s?.id).toBe("distributiv-gang");
    // Større er 7. Del i 3+4. 6×3=18, 6×4=24. 18+24=42
    expect(s?.steg).toContain("Del 7 i 3 + 4");
    expect(s?.steg).toContain("18 + 24 = 42");
  });

  it("ingen ganging-strategi for trivielle 1×N eller 0×N", () => {
    expect(strategiForOppgave(lag(1, 8, "×"))).toBeNull();
    expect(strategiForOppgave(lag(8, 1, "×"))).toBeNull();
  });

  it("ingen strategi for divisjon", () => {
    expect(strategiForOppgave(lag(56, 7, "÷"))).toBeNull();
  });
});
