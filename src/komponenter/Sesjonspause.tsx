"use client";

import { useEffect } from "react";

interface Props {
  onFortsett: () => void;
  onAvslutt: () => void;
}

export function Sesjonspause({ onFortsett, onAvslutt }: Props) {
  useEffect(() => {
    function håndterKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onFortsett();
      }
    }
    window.addEventListener("keydown", håndterKey);
    return () => window.removeEventListener("keydown", håndterKey);
  }, [onFortsett]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Sesjons-pause"
    >
      <div className="bg-yellow-50 border-8 border-blue-400 rounded-3xl p-8 md:p-10 text-center shadow-2xl max-w-md animate-pop">
        <p className="text-5xl mb-3">⏰</p>
        <p className="text-2xl font-black text-purple-700 mb-2">
          5 minutter har gått!
        </p>
        <p className="text-base text-gray-700 mb-6">
          Du har øvd godt i dag. Vil du ta en pause, eller fortsette litt til?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onAvslutt}
            className="bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-4 border-green-700 shadow"
          >
            Ferdig for i dag 👋
          </button>
          <button
            onClick={onFortsett}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-4 border-blue-700 shadow"
          >
            Litt mer 💪
          </button>
        </div>
      </div>
    </div>
  );
}
