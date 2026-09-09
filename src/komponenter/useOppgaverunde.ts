"use client";

import { useRef, useState } from "react";
import { oppdaterIndex } from "@/src/domene/arrayhjelper";

export function useOppgaverunde<TSvar>(
  antallOppgaver: number,
  lagTomtSvar: () => TSvar,
) {
  const [svar, setSvar] = useState<TSvar[]>(() =>
    Array.from({ length: antallOppgaver }, lagTomtSvar),
  );
  const [sjekket, setSjekket] = useState<boolean[]>(() =>
    Array(antallOppgaver).fill(false),
  );
  const sjekketRef = useRef<boolean[]>(Array(antallOppgaver).fill(false));

  function oppdaterSvar(i: number, oppdatering: TSvar | ((svar: TSvar) => TSvar)) {
    setSvar((forrige) =>
      oppdaterIndex(
        forrige,
        i,
        typeof oppdatering === "function"
          ? (oppdatering as (svar: TSvar) => TSvar)(forrige[i])
          : oppdatering,
      ),
    );
  }

  function prøvMarkerSjekket(i: number): boolean {
    if (sjekketRef.current[i]) return false;
    sjekketRef.current[i] = true;
    setSjekket((forrige) => oppdaterIndex(forrige, i, true));
    return true;
  }

  function markerSjekketMange(indekser: number[]): number[] {
    const nye = indekser.filter((i) => !sjekketRef.current[i]);
    if (nye.length === 0) return [];
    for (const i of nye) sjekketRef.current[i] = true;
    setSjekket([...sjekketRef.current]);
    return nye;
  }

  function prøvIgjen(i: number) {
    sjekketRef.current[i] = false;
    setSjekket((forrige) => oppdaterIndex(forrige, i, false));
    setSvar((forrige) => oppdaterIndex(forrige, i, lagTomtSvar()));
  }

  const alleSjekket =
    antallOppgaver > 0 &&
    sjekket.length === antallOppgaver &&
    sjekket.every(Boolean);

  return {
    svar,
    sjekket,
    alleSjekket,
    oppdaterSvar,
    prøvMarkerSjekket,
    markerSjekketMange,
    prøvIgjen,
  };
}

export function useGenerertRunde<T>() {
  const [runde, setRunde] = useState<{ id: number; oppgaver: T[] }>({
    id: 0,
    oppgaver: [],
  });

  function startRunde(oppgaver: T[]) {
    setRunde((forrige) => ({ id: forrige.id + 1, oppgaver }));
  }

  return { runde, startRunde };
}
