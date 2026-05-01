import { poengForOppgave } from "@/src/domene/poeng";
import type { Oppgave } from "@/src/domene/typer";

function pluss(a: number, b: number): Oppgave {
  return { a, b, operasjon: "+", svar: a + b };
}

describe("poengForOppgave", () => {
  it("1 poeng for 1-sifret pluss-svar", () => {
    expect(poengForOppgave(pluss(2, 3))).toBe(1);
  });

  it("2 poeng for 2-sifret pluss-svar", () => {
    expect(poengForOppgave(pluss(7, 8))).toBe(2);
  });

  it("3 poeng for 3-sifret pluss-svar", () => {
    expect(poengForOppgave(pluss(50, 60))).toBe(3);
  });

  it("samme regel for minus", () => {
    expect(poengForOppgave({ a: 8, b: 3, operasjon: "-", svar: 5 })).toBe(1);
    expect(poengForOppgave({ a: 50, b: 30, operasjon: "-", svar: 20 })).toBe(2);
  });

  it("multiplikasjon: sifre + 5 bonus", () => {
    expect(poengForOppgave({ a: 7, b: 8, operasjon: "×", svar: 56 })).toBe(2 + 5);
    expect(poengForOppgave({ a: 99, b: 99, operasjon: "×", svar: 9801 })).toBe(4 + 5);
  });

  it("divisjon: sifre + 10 bonus", () => {
    expect(poengForOppgave({ a: 56, b: 7, operasjon: "÷", svar: 8 })).toBe(1 + 10);
    expect(poengForOppgave({ a: 144, b: 12, operasjon: "÷", svar: 12 })).toBe(2 + 10);
  });

  it("maks 6 sifre i basis (cap)", () => {
    // 7-sifret svar fra × — basis cappes på 6, bonus = 5
    expect(
      poengForOppgave({ a: 9999, b: 999, operasjon: "×", svar: 9989001 }),
    ).toBe(6 + 5);
  });

  it("bruker absoluttverdi av svar (defensivt)", () => {
    // Selv om appen aldri produserer negative svar, skal funksjonen være robust
    expect(poengForOppgave({ a: 0, b: 5, operasjon: "-", svar: -5 })).toBe(1);
  });
});
