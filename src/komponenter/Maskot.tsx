"use client";

import { useEffect, useState } from "react";

const HEIA_MELDINGER = [
  "Heia!",
  "Du klarer det!",
  "Tenk i ro og mak.",
  "Strålende!",
  "Stå på!",
  "Du blir flinkere for hver gang.",
  "Husk å puste 😄",
  "En om gangen — du fikser det.",
  "Dette går!",
  "Litt etter litt, så blir det et fjell.",
];

interface Props {
  avatar: string;
}

// Liten figur som dukker opp med oppmuntrende meldinger.
// Meldingen byttes hvert 8. sekund.
export function Maskot({ avatar }: Props) {
  const [meldingIndex, setMeldingIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMeldingIndex((i) => (i + 1) % HEIA_MELDINGER.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end gap-2">
      <span className="text-3xl select-none">{avatar}</span>
      <div className="relative bg-white rounded-2xl border-2 border-purple-200 px-3 py-2 text-sm font-bold text-gray-700 shadow-sm max-w-xs">
        {HEIA_MELDINGER[meldingIndex]}
        <span
          className="absolute bottom-2 -left-2 w-3 h-3 bg-white border-l-2 border-b-2 border-purple-200 rotate-45"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
