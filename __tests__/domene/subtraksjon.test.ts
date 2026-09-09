import {
  antallIgjen,
  faseFor,
  klikkBall,
  lagBallmodell,
  lagEksempelmodell,
  lagSubtraksjonsoppgave,
} from "@/src/domene/subtraksjon";

describe("lagSubtraksjonsoppgave", () => {
  it("lager A − B uten negative svar innenfor valgt maksimum", () => {
    for (let i = 0; i < 100; i++) {
      const oppgave = lagSubtraksjonsoppgave(20);
      expect(oppgave.a).toBeGreaterThanOrEqual(1);
      expect(oppgave.a).toBeLessThanOrEqual(20);
      expect(oppgave.b).toBeGreaterThanOrEqual(1);
      expect(oppgave.b).toBeLessThanOrEqual(oppgave.a);
      expect(oppgave.svar).toBe(oppgave.a - oppgave.b);
      expect(oppgave.svar).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("ballmodellen", () => {
  const oppgave = { a: 3, b: 1, operasjon: "-" as const, svar: 2 };

  it("går fra å legge til A baller til å ta bort B og svare", () => {
    let modell = lagBallmodell(5);
    expect(faseFor(modell, oppgave)).toBe("legg-til");

    modell = klikkBall(modell, 0, oppgave);
    modell = klikkBall(modell, 1, oppgave);
    modell = klikkBall(modell, 2, oppgave);
    expect(faseFor(modell, oppgave)).toBe("ta-bort");

    modell = klikkBall(modell, 1, oppgave);
    expect(faseFor(modell, oppgave)).toBe("svar");
    expect(antallIgjen(modell)).toBe(2);
  });

  it("lar barnet angre uten å krysse ut flere enn B", () => {
    let modell = lagBallmodell(3);
    modell = klikkBall(modell, 0, oppgave);
    modell = klikkBall(modell, 1, oppgave);
    modell = klikkBall(modell, 2, oppgave);
    modell = klikkBall(modell, 0, oppgave);

    expect(klikkBall(modell, 1, oppgave)).toEqual(modell);

    modell = klikkBall(modell, 0, oppgave);
    expect(faseFor(modell, oppgave)).toBe("ta-bort");
    expect(antallIgjen(modell)).toBe(3);
  });

  it("bygger eksempelet med de samme overgangene som barnet bruker", () => {
    const etterTreKlikk = lagEksempelmodell(5, oppgave, 3);
    expect(faseFor(etterTreKlikk, oppgave)).toBe("ta-bort");

    const ferdig = lagEksempelmodell(5, oppgave, 4);
    expect(faseFor(ferdig, oppgave)).toBe("svar");
    expect(antallIgjen(ferdig)).toBe(2);
  });
});
