import { tallTilNavn } from "@/src/domene/tallNavn";

describe("tallTilNavn", () => {
  it.each([
    [0, "null"],
    [1, "én"],
    [5, "fem"],
    [9, "ni"],
  ])("ener %i → '%s'", (n, navn) => {
    expect(tallTilNavn(n)).toBe(navn);
  });

  it.each([
    [10, "ti"],
    [11, "elleve"],
    [12, "tolv"],
    [13, "tretten"],
    [14, "fjorten"],
    [15, "femten"],
    [16, "seksten"],
    [17, "sytten"],
    [18, "atten"],
    [19, "nitten"],
  ])("ti–nitten %i → '%s'", (n, navn) => {
    expect(tallTilNavn(n)).toBe(navn);
  });

  it.each([
    [20, "tjue"],
    [30, "tretti"],
    [40, "førti"],
    [50, "femti"],
    [60, "seksti"],
    [70, "sytti"],
    [80, "åtti"],
    [90, "nitti"],
  ])("hele tiere %i → '%s'", (n, navn) => {
    expect(tallTilNavn(n)).toBe(navn);
  });

  it.each([
    [21, "tjueén"],
    [25, "tjuefem"],
    [47, "førtisju"],
    [99, "nittini"],
  ])("tier+ener %i → '%s'", (n, navn) => {
    expect(tallTilNavn(n)).toBe(navn);
  });

  it.each([
    [100, "hundre"],
    [101, "hundre og én"],
    [125, "hundre og tjuefem"],
    [200, "to hundre"],
    [347, "tre hundre og førtisju"],
    [999, "ni hundre og nittini"],
  ])("hundretalls %i → '%s'", (n, navn) => {
    expect(tallTilNavn(n)).toBe(navn);
  });

  it("kaster ved ut-av-område", () => {
    expect(() => tallTilNavn(-1)).toThrow();
    expect(() => tallTilNavn(1000)).toThrow();
    expect(() => tallTilNavn(1.5)).toThrow();
  });
});
