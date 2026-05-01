"use client";

import type { Nivå } from "@/src/domene/titler";

interface Props {
  nivå: Nivå;
  onLukk: () => void;
}

const KONFETTI_EMOJIS = ["🎉", "✨", "⭐", "🌟", "🎊"];
const ANTALL_KONFETTI = 30;

export function Tittelfeiring({ nivå, onLukk }: Props) {
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
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: ANTALL_KONFETTI }).map((_, i) => {
        const venstre = (i / ANTALL_KONFETTI) * 100 + Math.random() * 5;
        const forsinkelse = Math.random() * 0.8;
        const varighet = 2 + Math.random() * 2;
        const emoji = KONFETTI_EMOJIS[i % KONFETTI_EMOJIS.length];
        return (
          <span
            key={i}
            className="absolute text-3xl confetti-piece"
            style={{
              left: `${venstre}%`,
              top: "-3rem",
              animationDelay: `${forsinkelse}s`,
              animationDuration: `${varighet}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
