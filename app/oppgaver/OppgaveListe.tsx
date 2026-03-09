"use client";

import { useEffect, useRef, useState } from "react";

// ── Typer ─────────────────────────────────────────────────────────────────────

export type Operasjon = "+" | "-" | "×" | "÷";

export interface Oppgave {
  a: number;
  b: number;
  operasjon: Operasjon;
  svar: number;
}

// ── Poeng ─────────────────────────────────────────────────────────────────────

// 1 poeng per siffer i svaret (maks 6), +5 for ×, +10 for ÷
export function poengForOppgave(oppgave: Oppgave): number {
  const sifre = Math.min(String(Math.abs(oppgave.svar)).length, 6);
  const bonus = oppgave.operasjon === "×" ? 5 : oppgave.operasjon === "÷" ? 10 : 0;
  return sifre + bonus;
}

// ── OppgaveListe ──────────────────────────────────────────────────────────────

interface Props {
  oppgaver: Oppgave[];
  leggTilPoeng: (p: number) => void;
  onNyRunde: () => void;
}

export default function OppgaveListe({ oppgaver, leggTilPoeng, onNyRunde }: Props) {
  const [svar, setSvar] = useState<string[]>(() => Array(oppgaver.length).fill(""));
  const [sjekket, setSjekket] = useState<boolean[]>(() => Array(oppgaver.length).fill(false));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state når parent sender nye oppgaver
  useEffect(() => {
    setSvar(Array(oppgaver.length).fill(""));
    setSjekket(Array(oppgaver.length).fill(false));
  }, [oppgaver]);

  function sjekkEtt(i: number) {
    if (svar[i] === "" || sjekket[i]) return;
    setSjekket((prev) => {
      const neste = [...prev];
      neste[i] = true;
      return neste;
    });
    if (Number(svar[i]) === oppgaver[i].svar) {
      leggTilPoeng(poengForOppgave(oppgaver[i]));
    }
  }

  function sjekkAlle() {
    const nySjekket = oppgaver.map((_, i) => svar[i] !== "");
    setSjekket(nySjekket);
    oppgaver.forEach((o, i) => {
      if (!sjekket[i] && nySjekket[i] && Number(svar[i]) === o.svar) {
        leggTilPoeng(poengForOppgave(o));
      }
    });
  }

  const alleSjekket =
    oppgaver.length > 0 &&
    sjekket.length === oppgaver.length &&
    sjekket.every(Boolean);
  const antallRiktige = oppgaver.filter(
    (o, i) => sjekket[i] && Number(svar[i]) === o.svar
  ).length;

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      {alleSjekket && (
        <p className="text-2xl font-black text-center text-green-700 mb-2">
          {antallRiktige} / {oppgaver.length} riktige!{" "}
          {antallRiktige === oppgaver.length ? "🎉" : "💪"}
        </p>
      )}

      {oppgaver.map((o, i) => {
        const riktig = sjekket[i] ? Number(svar[i]) === o.svar : null;
        return (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
              riktig === true
                ? "border-green-400 bg-green-50"
                : riktig === false
                ? "border-red-300 bg-red-50"
                : "border-yellow-200 bg-white"
            }`}
          >
            <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
              {i + 1}.
            </span>
            <span className="text-2xl font-bold text-purple-500">{o.a}</span>
            <span className="text-2xl font-bold text-gray-500">{o.operasjon}</span>
            <span className="text-2xl font-bold text-green-500">{o.b}</span>
            <span className="text-2xl font-bold text-gray-500">=</span>
            <input
              type="number"
              value={svar[i]}
              onChange={(e) => {
                const nyttSvar = [...svar];
                nyttSvar[i] = e.target.value;
                setSvar(nyttSvar);
              }}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              onBlur={() => sjekkEtt(i)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                sjekkEtt(i);
                inputRefs.current[i + 1]?.focus();
              }}
              disabled={sjekket[i]}
              autoFocus={i === 0}
              className={`w-24 text-center text-2xl font-bold border-2 rounded-xl py-1 focus:outline-none ${
                riktig === true
                  ? "border-green-400 bg-green-50"
                  : riktig === false
                  ? "border-red-400 bg-red-50"
                  : "border-blue-300 focus:border-blue-500 bg-white"
              }`}
              placeholder="?"
            />
            {riktig === true && <span className="text-2xl shrink-0">✅</span>}
            {riktig === false && (
              <span className="text-lg font-bold text-red-500 shrink-0">
                = {o.svar} ❌
              </span>
            )}
          </div>
        );
      })}

      {!alleSjekket && (
        <button
          onClick={sjekkAlle}
          className="mt-2 bg-blue-400 hover:bg-blue-500 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-blue-600 transition-colors self-start shadow"
        >
          Sjekk svar! 🔍
        </button>
      )}
      {alleSjekket && (
        <button
          onClick={onNyRunde}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 transition-colors self-start shadow"
        >
          Ny runde! 🎲
        </button>
      )}
    </div>
  );
}
