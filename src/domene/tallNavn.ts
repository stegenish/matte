// Norsk numerisk navngivning for tall 0–999.
// Bruker moderne form: "førtisju" framfor "syvogførti". For 1: "én".

const ENERE = [
  "null", "én", "to", "tre", "fire", "fem", "seks", "sju", "åtte", "ni",
] as const;

const TI_TIL_NITTEN = [
  "ti", "elleve", "tolv", "tretten", "fjorten",
  "femten", "seksten", "sytten", "atten", "nitten",
] as const;

const TIERE = [
  "", "", "tjue", "tretti", "førti", "femti", "seksti", "sytti", "åtti", "nitti",
] as const;

export function tallTilNavn(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) {
    throw new RangeError(`tallTilNavn støtter bare 0–999, fikk ${n}`);
  }
  if (n < 10) return ENERE[n];
  if (n < 20) return TI_TIL_NITTEN[n - 10];
  if (n < 100) {
    const tier = Math.floor(n / 10);
    const ener = n % 10;
    return ener === 0 ? TIERE[tier] : `${TIERE[tier]}${ENERE[ener]}`;
  }
  const hundre = Math.floor(n / 100);
  const rest = n % 100;
  const hundreNavn = hundre === 1 ? "hundre" : `${ENERE[hundre]} hundre`;
  return rest === 0 ? hundreNavn : `${hundreNavn} og ${tallTilNavn(rest)}`;
}
