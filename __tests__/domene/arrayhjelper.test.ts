import { oppdaterIndex } from "@/src/domene/arrayhjelper";

describe("oppdaterIndex", () => {
  it("oppdaterer angitt indeks", () => {
    expect(oppdaterIndex([1, 2, 3], 1, 99)).toEqual([1, 99, 3]);
  });

  it("muterer ikke originalen", () => {
    const original = [1, 2, 3];
    oppdaterIndex(original, 1, 99);
    expect(original).toEqual([1, 2, 3]);
  });

  it("aksepterer readonly-array", () => {
    const original: readonly string[] = ["a", "b", "c"];
    expect(oppdaterIndex(original, 0, "z")).toEqual(["z", "b", "c"]);
  });
});
