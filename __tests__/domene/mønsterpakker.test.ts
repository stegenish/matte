import {
  FORHÅNDS_PAKKER,
  lagEgenPakke,
  pakkeMedId,
} from "@/src/domene/mønsterpakker";

describe("FORHÅNDS_PAKKER", () => {
  it("har unike id-er", () => {
    const idSett = new Set(FORHÅNDS_PAKKER.map((p) => p.id));
    expect(idSett.size).toBe(FORHÅNDS_PAKKER.length);
  });

  it.each(FORHÅNDS_PAKKER.map((p) => [p.id]))(
    "%s genererer ikke-tom liste med korrekte oppgaver",
    (id) => {
      const pakke = pakkeMedId(id);
      expect(pakke).toBeDefined();
      const oppgaver = pakke!.generer();
      expect(oppgaver.length).toBeGreaterThan(0);
      for (const o of oppgaver) {
        const forventetSvar =
          o.operasjon === "+"
            ? o.a + o.b
            : o.operasjon === "-"
            ? o.a - o.b
            : o.operasjon === "×"
            ? o.a * o.b
            : o.a / o.b;
        expect(o.svar).toBe(forventetSvar);
      }
    },
  );

  it("tiervenner: alle oppgaver bruker 10 som a og partner 1–9 som b", () => {
    const oppgaver = pakkeMedId("tiervenner")!.generer();
    expect(oppgaver).toHaveLength(9);
    expect(oppgaver.every((o) => o.a === 10 && o.operasjon === "-")).toBe(true);
    expect(oppgaver.map((o) => o.b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("lily-pluss-1: alle starter på 9-tall og legger til 1", () => {
    const oppgaver = pakkeMedId("lily-pluss-1")!.generer();
    expect(oppgaver).toHaveLength(10);
    expect(oppgaver.every((o) => o.b === 1 && o.a % 10 === 9)).toBe(true);
  });

  it("lily-minus-2: alle er tier minus 2", () => {
    const oppgaver = pakkeMedId("lily-minus-2")!.generer();
    expect(oppgaver).toHaveLength(10);
    expect(
      oppgaver.every((o) => o.b === 2 && o.operasjon === "-" && o.a % 10 === 0),
    ).toBe(true);
  });

  it("dobling: a er lik b for alle oppgaver", () => {
    const oppgaver = pakkeMedId("dobling")!.generer();
    expect(oppgaver.every((o) => o.a === o.b)).toBe(true);
  });

  it("halvering: alle b er 2 og svar = a/2", () => {
    const oppgaver = pakkeMedId("halvering")!.generer();
    expect(oppgaver.every((o) => o.b === 2 && o.operasjon === "÷")).toBe(true);
  });
});

describe("lagEgenPakke", () => {
  it("genererer addisjonsserie fra start + steg", () => {
    const pakke = lagEgenPakke(3, 4, 4);
    const oppgaver = pakke.generer();
    expect(oppgaver).toEqual([
      { a: 3, b: 4, operasjon: "+", svar: 7 },
      { a: 7, b: 4, operasjon: "+", svar: 11 },
      { a: 11, b: 4, operasjon: "+", svar: 15 },
      { a: 15, b: 4, operasjon: "+", svar: 19 },
    ]);
  });

  it("kapper antall til [1, 20]", () => {
    expect(lagEgenPakke(0, 1, 0).generer()).toHaveLength(1);
    expect(lagEgenPakke(0, 1, 100).generer()).toHaveLength(20);
  });

  it("default antall er 10", () => {
    expect(lagEgenPakke(0, 1).generer()).toHaveLength(10);
  });

  it("har unik id basert på parameter", () => {
    expect(lagEgenPakke(3, 4).id).not.toBe(lagEgenPakke(3, 5).id);
    expect(lagEgenPakke(3, 4).id).not.toBe(lagEgenPakke(4, 4).id);
  });
});

describe("pakkeMedId", () => {
  it("finner eksisterende pakke", () => {
    expect(pakkeMedId("tiervenner")?.navn).toBe("Tiervenner");
  });

  it("returnerer undefined for ukjent id", () => {
    expect(pakkeMedId("finnes-ikke")).toBeUndefined();
  });
});
