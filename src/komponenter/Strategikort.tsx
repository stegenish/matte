"use client";

import type { Strategi } from "@/src/domene/strategier";

export function Strategikort({ strategi }: { strategi: Strategi }) {
  return (
    <aside
      className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 mt-2 max-w-md"
      aria-label="Hint"
    >
      <p className="text-sm font-bold text-blue-700 mb-1">💡 {strategi.navn}</p>
      <ol className="flex flex-col gap-0.5">
        {strategi.steg.map((linje, i) => (
          <li
            key={i}
            className={`text-base font-bold ${
              i === 0 ? "text-gray-700" : "text-blue-800"
            }`}
          >
            {linje}
          </li>
        ))}
      </ol>
    </aside>
  );
}
