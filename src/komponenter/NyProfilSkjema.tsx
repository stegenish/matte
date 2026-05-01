"use client";

import { useState } from "react";
import { useProfil } from "./ProfilProvider";
import { STANDARD_AVATARER } from "@/src/domene/profil";

interface Props {
  avbrytbar: boolean;
  onAvbryt: () => void;
  onOpprettet: () => void;
}

export function NyProfilSkjema({ avbrytbar, onAvbryt, onOpprettet }: Props) {
  const { opprett } = useProfil();
  const [navn, setNavn] = useState("");
  const [valgtAvatar, setValgtAvatar] = useState<string>(STANDARD_AVATARER[0]);

  const trimmetNavn = navn.trim();
  const kanLagre = trimmetNavn.length > 0;

  function lagre() {
    if (!kanLagre) return;
    opprett(trimmetNavn, valgtAvatar);
    onOpprettet();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 py-12 px-6">
      <h1 className="text-4xl md:text-6xl font-black text-purple-600 drop-shadow-md mb-8 text-center">
        Ny profil
      </h1>

      <div className="bg-white border-4 border-yellow-300 rounded-3xl p-8 shadow-lg w-full max-w-lg flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-xl font-bold text-gray-700">Hva heter du?</span>
          <input
            type="text"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") lagre();
            }}
            autoFocus
            maxLength={20}
            className="text-2xl font-bold border-4 border-blue-300 focus:border-blue-500 rounded-2xl px-4 py-3 focus:outline-none"
            placeholder="Navnet ditt"
          />
        </label>

        <div>
          <p className="text-xl font-bold text-gray-700 mb-3">Velg figur</p>
          <ul className="grid grid-cols-5 gap-3">
            {STANDARD_AVATARER.map((emoji) => (
              <li key={emoji}>
                <button
                  onClick={() => setValgtAvatar(emoji)}
                  className={`w-full aspect-square text-4xl rounded-2xl border-4 transition-colors ${
                    valgtAvatar === emoji
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-400"
                  }`}
                  aria-label={emoji}
                  aria-pressed={valgtAvatar === emoji}
                >
                  {emoji}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          {avbrytbar && (
            <button
              onClick={onAvbryt}
              className="flex-1 bg-white hover:bg-gray-100 text-gray-600 text-xl font-black px-6 py-3 rounded-2xl border-4 border-gray-300 transition-colors"
            >
              Avbryt
            </button>
          )}
          <button
            onClick={lagre}
            disabled={!kanLagre}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-black px-6 py-3 rounded-2xl border-4 border-green-700 disabled:border-gray-400 transition-colors shadow"
          >
            Lagre
          </button>
        </div>
      </div>
    </main>
  );
}
