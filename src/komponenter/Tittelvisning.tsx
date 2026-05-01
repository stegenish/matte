"use client";

import type { Profil } from "@/src/domene/profil";
import {
  ANTALL_NIVÅER,
  nivåForPoeng,
  poengGrenseForNivå,
} from "@/src/domene/titler";

export function Tittelvisning({ profil }: { profil: Profil }) {
  const nivå = nivåForPoeng(profil.poeng);
  const erMaks = nivå.index >= ANTALL_NIVÅER - 1;
  const nesteGrense = erMaks ? nivå.poengGrense : poengGrenseForNivå(nivå.index + 1);
  const fremgang = erMaks
    ? 1
    : (profil.poeng - nivå.poengGrense) / (nesteGrense - nivå.poengGrense);

  return (
    <div className="flex flex-col items-center gap-1 px-6 pt-2 pb-3">
      <p className="text-2xl font-black text-purple-600 text-center">
        {nivå.adjektiv} {nivå.tittel}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-xl font-black text-gray-700">{profil.poeng}</span>
        {erMaks ? (
          <span className="text-sm text-gray-500 font-bold">(maks!)</span>
        ) : (
          <span className="text-sm text-gray-500 font-bold">/ {nesteGrense}</span>
        )}
      </div>
      <div
        className="w-64 h-2 bg-yellow-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(fremgang * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${Math.min(100, fremgang * 100)}%` }}
        />
      </div>
    </div>
  );
}
