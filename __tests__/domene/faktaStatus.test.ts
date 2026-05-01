import {
  nøkkelForOppgave,
  oppdaterFaktaStatus,
  plukkVanskeligste,
  vanskelighetsskår,
} from "@/src/domene/faktaStatus";
import type { FaktaStatus } from "@/src/domene/profil";

describe("nøkkelForOppgave", () => {
  it("multiplikasjon: alltid mindre × større", () => {
    expect(nøkkelForOppgave({ a: 7, b: 8, operasjon: "×", svar: 56 })).toBe(
      "7×8",
    );
    expect(nøkkelForOppgave({ a: 8, b: 7, operasjon: "×", svar: 56 })).toBe(
      "7×8",
    );
  });

  it("addisjon, subtraksjon, divisjon: bevarer rekkefølge", () => {
    expect(nøkkelForOppgave({ a: 3, b: 5, operasjon: "+", svar: 8 })).toBe("3+5");
    expect(nøkkelForOppgave({ a: 12, b: 5, operasjon: "-", svar: 7 })).toBe(
      "12-5",
    );
    expect(nøkkelForOppgave({ a: 56, b: 7, operasjon: "÷", svar: 8 })).toBe(
      "56÷7",
    );
  });
});

describe("oppdaterFaktaStatus", () => {
  it("legger til nytt fakta når nøkkel ikke finnes", () => {
    const ny = oppdaterFaktaStatus([], "7×8", true);
    expect(ny).toHaveLength(1);
    expect(ny[0].oppgaveNøkkel).toBe("7×8");
    expect(ny[0].rette).toBe(1);
    expect(ny[0].feile).toBe(0);
  });

  it("inkrementerer eksisterende fakta", () => {
    let liste: FaktaStatus[] = [];
    liste = oppdaterFaktaStatus(liste, "7×8", true);
    liste = oppdaterFaktaStatus(liste, "7×8", false);
    liste = oppdaterFaktaStatus(liste, "7×8", true);
    expect(liste).toHaveLength(1);
    expect(liste[0].rette).toBe(2);
    expect(liste[0].feile).toBe(1);
  });

  it("muterer ikke originalen", () => {
    const original: FaktaStatus[] = [];
    oppdaterFaktaStatus(original, "7×8", true);
    expect(original).toEqual([]);
  });
});

describe("vanskelighetsskår", () => {
  it("0 når ingen forsøk", () => {
    expect(
      vanskelighetsskår({ oppgaveNøkkel: "x", rette: 0, feile: 0, sistVist: "" }),
    ).toBe(0);
  });

  it("0 når alt er rett", () => {
    expect(
      vanskelighetsskår({ oppgaveNøkkel: "x", rette: 5, feile: 0, sistVist: "" }),
    ).toBe(0);
  });

  it("1 når alt er feil", () => {
    expect(
      vanskelighetsskår({ oppgaveNøkkel: "x", rette: 0, feile: 3, sistVist: "" }),
    ).toBe(1);
  });

  it("0.5 når halvparten er feil", () => {
    expect(
      vanskelighetsskår({ oppgaveNøkkel: "x", rette: 2, feile: 2, sistVist: "" }),
    ).toBe(0.5);
  });
});

describe("plukkVanskeligste", () => {
  it("returnerer N mest feilrate-prone fakta", () => {
    const liste: FaktaStatus[] = [
      { oppgaveNøkkel: "lett", rette: 10, feile: 0, sistVist: "" },
      { oppgaveNøkkel: "vanskelig", rette: 1, feile: 5, sistVist: "" },
      { oppgaveNøkkel: "middels", rette: 3, feile: 3, sistVist: "" },
    ];
    const valgt = plukkVanskeligste(liste, 2);
    expect(valgt[0].oppgaveNøkkel).toBe("vanskelig");
    expect(valgt[1].oppgaveNøkkel).toBe("middels");
  });
});
