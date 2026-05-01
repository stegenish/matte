"use client";

import { useState } from "react";
import { useProfil } from "./ProfilProvider";
import { NyProfilSkjema } from "./NyProfilSkjema";

export function Profilvelger() {
  const { alleProfiler, velg, slett, klar } = useProfil();
  const [viserSkjema, setViserSkjema] = useState(false);

  if (!klar) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-yellow-100">
        <p className="text-2xl text-gray-500">Laster …</p>
      </main>
    );
  }

  if (viserSkjema || alleProfiler.length === 0) {
    return (
      <NyProfilSkjema
        avbrytbar={alleProfiler.length > 0}
        onAvbryt={() => setViserSkjema(false)}
        onOpprettet={() => setViserSkjema(false)}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 py-12 px-6">
      <h1 className="text-5xl md:text-7xl font-black text-purple-600 drop-shadow-md mb-12 text-center">
        Hvem spiller?
      </h1>

      <ul className="flex flex-wrap gap-6 justify-center max-w-3xl">
        {alleProfiler.map((p) => (
          <li key={p.id} className="relative">
            <button
              onClick={() => velg(p.id)}
              className="flex flex-col items-center bg-white border-4 border-yellow-300 rounded-3xl p-6 hover:border-green-500 hover:bg-green-50 active:bg-green-100 transition-colors shadow-lg w-44"
            >
              <span className="text-7xl mb-2" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="text-2xl font-black text-gray-700">{p.navn}</span>
              <span className="text-sm text-yellow-600 font-bold mt-1">
                ⭐ {p.poeng}
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Slette profilen til ${p.navn}?`)) slett(p.id);
              }}
              className="absolute -top-2 -right-2 bg-red-400 hover:bg-red-500 text-white text-sm font-black w-8 h-8 rounded-full border-2 border-white shadow"
              aria-label={`Slett ${p.navn}`}
              title="Slett profil"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setViserSkjema(true)}
        className="mt-10 bg-green-500 hover:bg-green-600 text-white text-2xl font-black px-8 py-4 rounded-3xl border-4 border-green-700 transition-colors shadow-lg"
      >
        + Ny profil
      </button>
    </main>
  );
}
