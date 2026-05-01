"use client";

import { useEffect, useMemo } from "react";
import type { Nivå } from "@/src/domene/titler";

interface Props {
  nivå: Nivå;
  onLukk: () => void;
}

const KONFETTI_EMOJIS = ["🎉", "✨", "⭐", "🌟", "🎊"];
const ANTALL_KONFETTI = 30;

interface KonfettiBit {
  venstre: number;
  forsinkelse: number;
  varighet: number;
  emoji: string;
}

// Math.random må kalles utenfor render for å holde komponenten ren.
// Konfetti-data beregnes én gang når dialogen åpnes.
function lagKonfetti(): KonfettiBit[] {
  return Array.from({ length: ANTALL_KONFETTI }, (_, i) => ({
    venstre: (i / ANTALL_KONFETTI) * 100 + Math.random() * 5,
    forsinkelse: Math.random() * 0.8,
    varighet: 2 + Math.random() * 2,
    emoji: KONFETTI_EMOJIS[i % KONFETTI_EMOJIS.length],
  }));
}

export function Tittelfeiring({ nivå, onLukk }: Props) {
  // Enter eller Escape lukker dialogen
  useEffect(() => {
    function håndterKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        onLukk();
      }
    }
    window.addEventListener("keydown", håndterKey);
    return () => window.removeEventListener("keydown", håndterKey);
  }, [onLukk]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Ny tittel oppnådd"
    >
      <Konfetti />
      <div className="relative bg-yellow-100 border-8 border-purple-500 rounded-3xl p-10 md:p-12 text-center shadow-2xl max-w-lg mx-6 animate-pop">
        <p className="text-6xl mb-3">🎉</p>
        <p className="text-2xl md:text-3xl font-black text-purple-600 mb-3">
          Ny tittel!
        </p>
        <p className="text-3xl md:text-5xl font-black text-pink-500 mb-6 leading-tight">
          {nivå.adjektiv} {nivå.tittel}
        </p>
        <button
          className="bg-green-500 hover:bg-green-600 text-white text-xl md:text-2xl font-black px-8 py-3 rounded-2xl border-4 border-green-700 shadow"
          onClick={onLukk}
        >
          Tusen takk! 🙏
        </button>
      </div>
    </div>
  );
}

function Konfetti() {
  // Random én gang per åpning av dialog — ikke ved hver re-render
  const biter = useMemo(() => lagKonfetti(), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {biter.map((bit, i) => {
        return (
          <span
            key={i}
            className="absolute text-3xl confetti-piece"
            style={{
              left: `${bit.venstre}%`,
              top: "-3rem",
              animationDelay: `${bit.forsinkelse}s`,
              animationDuration: `${bit.varighet}s`,
            }}
          >
            {bit.emoji}
          </span>
        );
      })}
    </div>
  );
}
