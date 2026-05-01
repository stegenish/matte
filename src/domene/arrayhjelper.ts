// Returnerer en ny array med element ved indeks `i` byttet til `verdi`.
// Bruk når du trenger å oppdatere én plass uten å mutere originalen.
export function oppdaterIndex<T>(arr: readonly T[], i: number, verdi: T): T[] {
  const ny = [...arr];
  ny[i] = verdi;
  return ny;
}
