import {
  TALL_PAKKER,
  lagDistraktorer,
  tallPakkeMedId,
} from "@/src/domene/tallpakker";

describe("lagDistraktorer", () => {
  it("returnerer angitt antall unike distraktorer", () => {
    const d = lagDistraktorer(47, 3);
    expect(d).toHaveLength(3);
    expect(new Set(d).size).toBe(3);
  });

  it("inkluderer aldri svaret selv", () => {
    for (let i = 0; i < 50; i++) {
      const d = lagDistraktorer(47, 3);
      expect(d).not.toContain(47);
    }
  });

  it("holder distraktorer i samme størrelsesorden som svaret", () => {
    for (let i = 0; i < 50; i++) {
      const d = lagDistraktorer(47, 3);
      for (const x of d) {
        expect(x).toBeGreaterThanOrEqual(10);
        expect(x).toBeLessThanOrEqual(99);
      }
    }
  });

  it("klarer 1-sifret svar", () => {
    const d = lagDistraktorer(5, 3);
    expect(d).toHaveLength(3);
    for (const x of d) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(9);
    }
  });
});

describe("TALL_PAKKER", () => {
  it("har unike id-er", () => {
    const ids = new Set(TALL_PAKKER.map((p) => p.id));
    expect(ids.size).toBe(TALL_PAKKER.length);
  });

  it.each(TALL_PAKKER.map((p) => [p.id, p.modus]))(
    "%s genererer ikke-tom oppgaveliste i riktig modus",
    (id, modus) => {
      const pakke = tallPakkeMedId(id as string)!;
      const oppgaver = pakke.generer();
      expect(oppgaver.length).toBeGreaterThan(0);
      for (const o of oppgaver) {
        expect(o.modus).toBe(modus);
        expect(typeof o.navn).toBe("string");
        expect(o.navn.length).toBeGreaterThan(0);
      }
    },
  );

  it("lese-pakker har 4 alternativer der svaret er inkludert", () => {
    const lesePakker = TALL_PAKKER.filter((p) => p.modus === "lese");
    for (const pakke of lesePakker) {
      const oppgaver = pakke.generer();
      for (const o of oppgaver) {
        expect(o.alternativer).toBeDefined();
        expect(o.alternativer).toHaveLength(4);
        expect(o.alternativer).toContain(o.tall);
        expect(new Set(o.alternativer).size).toBe(4);
      }
    }
  });

  it("skrive-pakker har ingen alternativer", () => {
    const skrivePakker = TALL_PAKKER.filter((p) => p.modus === "skrive");
    for (const pakke of skrivePakker) {
      const oppgaver = pakke.generer();
      for (const o of oppgaver) {
        expect(o.alternativer).toBeUndefined();
      }
    }
  });
});
