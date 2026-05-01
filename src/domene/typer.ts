export type Operasjon = "+" | "-" | "×" | "÷";

export interface Oppgave {
  a: number;
  b: number;
  operasjon: Operasjon;
  svar: number;
}
