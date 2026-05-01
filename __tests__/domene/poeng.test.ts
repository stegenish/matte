import { poengForOppgave, harTieroverganger } from "@/src/domene/poeng";
import type { Oppgave } from "@/src/domene/typer";

function pluss(a: number, b: number): Oppgave {
  return { a, b, operasjon: "+", svar: a + b };
}

function minus(a: number, b: number): Oppgave {
  return { a, b, operasjon: "-", svar: a - b };
}

function ganger(a: number, b: number): Oppgave {
  return { a, b, operasjon: "×", svar: a * b };
}

function deler(a: number, b: number): Oppgave {
  return { a, b, operasjon: "÷", svar: a / b };
}

describe("harTieroverganger", () => {
  it("pluss krysser tier når enerne summeres til ≥ 10", () => {
    expect(harTieroverganger(pluss(7, 8))).toBe(true);
    expect(harTieroverganger(pluss(27, 8))).toBe(true);
    expect(harTieroverganger(pluss(9, 1))).toBe(true);
  });

  it("pluss krysser ikke tier når enerne summeres til < 10", () => {
    expect(harTieroverganger(pluss(3, 4))).toBe(false);
    expect(harTieroverganger(pluss(22, 5))).toBe(false);
    expect(harTieroverganger(pluss(10, 5))).toBe(false);
  });

  it("minus krysser tier når enerne i a er mindre enn enerne i b", () => {
    expect(harTieroverganger(minus(12, 5))).toBe(true);
    expect(harTieroverganger(minus(25, 7))).toBe(true);
    expect(harTieroverganger(minus(22, 5))).toBe(true);
  });

  it("minus krysser ikke tier når enerne i a er ≥ enerne i b", () => {
    expect(harTieroverganger(minus(8, 3))).toBe(false);
    expect(harTieroverganger(minus(27, 5))).toBe(false);
    expect(harTieroverganger(minus(50, 30))).toBe(false);
  });

  it("× og ÷ regnes ikke som tieroverganger", () => {
    expect(harTieroverganger(ganger(7, 8))).toBe(false);
    expect(harTieroverganger(deler(56, 7))).toBe(false);
  });
});

describe("poengForOppgave", () => {
  it("1 poeng for 1-sifret pluss uten tieroverganger", () => {
    expect(poengForOppgave(pluss(2, 3))).toBe(1);
  });

  it("2-sifret pluss uten tieroverganger gir 2 poeng", () => {
    expect(poengForOppgave(pluss(10, 5))).toBe(2);
  });

  it("2-sifret pluss MED tieroverganger gir 3 poeng (sifre + tier-bonus)", () => {
    expect(poengForOppgave(pluss(7, 8))).toBe(3);
  });

  it("3-sifret svar uten tier får sifre-bonus (3 + 1 = 4 poeng)", () => {
    expect(poengForOppgave(pluss(50, 60))).toBe(4);
  });

  it("minus uten borrow: 1 poeng", () => {
    expect(poengForOppgave(minus(8, 3))).toBe(1);
  });

  it("minus med borrow: 1 + 1 = 2 poeng", () => {
    expect(poengForOppgave(minus(12, 5))).toBe(2);
  });

  it("multiplikasjon: sifre + 1 bonus", () => {
    expect(poengForOppgave(ganger(7, 8))).toBe(2 + 1);
    expect(poengForOppgave(ganger(99, 99))).toBe(4 + 1 + 1); // 4 sifre + × + tresifret
  });

  it("divisjon: sifre + 2 bonus", () => {
    expect(poengForOppgave(deler(56, 7))).toBe(1 + 2);
    expect(poengForOppgave(deler(144, 12))).toBe(2 + 2);
  });

  it("maks 6 sifre i basis (cap)", () => {
    // 7-sifret svar: basis cappes på 6, + tresifret-bonus + ×-bonus
    expect(poengForOppgave({ a: 9999, b: 999, operasjon: "×", svar: 9989001 })).toBe(
      6 + 1 + 1,
    );
  });

  it("bruker absoluttverdi av svar for sifre-utregning (defensivt)", () => {
    // Negative svar produseres ikke av appen, men funksjonen skal være robust.
    // 0-5 = -5 → 1 sifre (abs), og borrow-tier: 1 + 1 = 2 poeng.
    expect(poengForOppgave({ a: 0, b: 5, operasjon: "-", svar: -5 })).toBe(2);
  });

  it("multiplikasjon med stort svar får både ×-bonus og tresifret-bonus", () => {
    // 12 × 12 = 144, 3 sifre + × + tresifret = 5
    expect(poengForOppgave(ganger(12, 12))).toBe(3 + 1 + 1);
  });
});
