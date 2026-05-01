"use client";

import { useEffect, useRef, useState } from "react";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import { nøkkelForOppgave } from "@/src/domene/faktaStatus";

interface Props {
  tabeller: number[];
  onAvslutt: () => void;
  leggTilPoeng: (p: number) => void;
}

const LYN_LENGDE_SEK = 60;
const POENG_PER_RIKTIG = 2;
const REKORD_BONUS = 20;

interface Oppgave {
  a: number;
  b: number;
  svar: number;
}

function lagOppgave(tabeller: number[]): Oppgave {
  const a = tabeller[Math.floor(Math.random() * tabeller.length)];
  const b = 1 + Math.floor(Math.random() * 10);
  return { a, b, svar: a * b };
}

export function LynRunde({ tabeller, onAvslutt, leggTilPoeng }: Props) {
  const { aktivProfil, oppdater, registrerSvar } = useProfil();
  const [tilbake, setTilbake] = useState(LYN_LENGDE_SEK);
  const [riktige, setRiktige] = useState(0);
  const [feil, setFeil] = useState(0);
  const [oppgave, setOppgave] = useState<Oppgave>(() => lagOppgave(tabeller));
  const [svar, setSvar] = useState("");
  const [ferdig, setFerdig] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ferdigRef = useRef(false);

  useEffect(() => {
    if (ferdig) return;
    const id = setInterval(() => {
      setTilbake((t) => {
        if (t <= 1) {
          clearInterval(id);
          ferdigRef.current = true;
          setFerdig(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [ferdig]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [oppgave]);

  // Når lyn-runden er ferdig: oppdater rekord + gi bonus atomisk
  // (én funksjonell oppdater så rekord-feltet ikke overskrives av poeng-oppdatering)
  useEffect(() => {
    if (!ferdig) return;
    oppdater((forrige) => {
      if (riktige <= forrige.lynRekord) return forrige; // ingen ny rekord
      return {
        ...forrige,
        lynRekord: riktige,
        poeng: forrige.poeng + REKORD_BONUS,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ferdig]);

  function håndterSvar() {
    if (ferdigRef.current) return;
    const innskrevet = Number(svar);
    if (svar === "" || !Number.isFinite(innskrevet)) return;
    const erRett = innskrevet === oppgave.svar;
    registrerSvar(
      nøkkelForOppgave({ a: oppgave.a, b: oppgave.b, operasjon: "×", svar: oppgave.svar }),
      erRett,
    );
    if (erRett) {
      setRiktige((r) => r + 1);
      leggTilPoeng(POENG_PER_RIKTIG);
    } else {
      setFeil((f) => f + 1);
    }
    setSvar("");
    setOppgave(lagOppgave(tabeller));
  }

  if (ferdig) {
    const erNyRekord = aktivProfil && riktige > aktivProfil.lynRekord;
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-4xl font-black text-purple-600">Tiden er ute! ⏰</h2>
        {erNyRekord && (
          <p className="text-3xl font-black text-pink-500">🏆 Ny rekord!</p>
        )}
        <p className="text-2xl font-bold text-gray-700">
          {riktige} riktige · {feil} feil
        </p>
        <p className="text-lg text-gray-600">
          Forrige rekord: {aktivProfil?.lynRekord ?? 0}
        </p>
        <button
          onClick={onAvslutt}
          className="bg-green-500 hover:bg-green-600 text-white text-2xl font-black px-8 py-3 rounded-2xl border-4 border-green-700 shadow"
        >
          Tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="flex items-baseline gap-6">
        <span className="text-3xl font-black text-orange-500">⏱ {tilbake}s</span>
        <span className="text-2xl font-bold text-green-700">✓ {riktige}</span>
        <span className="text-2xl font-bold text-red-500">✗ {feil}</span>
      </div>
      <div className="flex items-center gap-4 text-5xl font-black">
        <span className="text-purple-500">{oppgave.a}</span>
        <span className="text-gray-500">×</span>
        <span className="text-green-500">{oppgave.b}</span>
        <span className="text-gray-500">=</span>
        <input
          ref={inputRef}
          type="number"
          value={svar}
          onChange={(e) => setSvar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") håndterSvar();
          }}
          autoFocus
          className="w-32 text-center text-5xl font-black border-4 border-blue-300 focus:border-blue-500 rounded-2xl py-2 focus:outline-none"
          placeholder="?"
        />
      </div>
      <button
        onClick={håndterSvar}
        className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black px-6 py-2 rounded-2xl border-2 border-blue-700"
      >
        Svar
      </button>
      <button
        onClick={onAvslutt}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Avbryt
      </button>
    </div>
  );
}
