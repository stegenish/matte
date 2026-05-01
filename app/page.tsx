"use client";

import Link from "next/link";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import { Profilvelger } from "@/src/komponenter/Profilvelger";
import { Tårn, FunFactForEtasje } from "@/src/komponenter/Tårn";
import { nivåForPoeng, tårnEtasjeForIndex } from "@/src/domene/titler";

export default function Home() {
  const { aktivProfil, loggUt, klar } = useProfil();

  if (!klar) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-yellow-100">
        <p className="text-2xl text-gray-500">Laster …</p>
      </main>
    );
  }

  if (!aktivProfil) return <Profilvelger />;

  const nivå = nivåForPoeng(aktivProfil.poeng);
  const etasje = tårnEtasjeForIndex(nivå.index);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 py-12 px-6 gap-6">
      <button
        onClick={loggUt}
        className="absolute top-4 right-4 text-base font-bold text-gray-500 hover:text-gray-700 underline"
      >
        Bytt spiller
      </button>

      <h1 className="text-center leading-tight font-black tracking-wide">
        <span className="block text-5xl md:text-7xl text-pink-500 drop-shadow-md mb-1">
          Hei
        </span>
        <span className="block text-6xl md:text-8xl text-green-500 drop-shadow-lg flex items-center justify-center gap-3">
          <span>{aktivProfil.avatar}</span>
          <span>{aktivProfil.navn}!</span>
        </span>
      </h1>

      <div className="flex flex-col items-center gap-3 max-w-md">
        <Tårn etasje={etasje} navn={aktivProfil.navn} />
        <FunFactForEtasje etasje={etasje} />
      </div>

      <Link
        href="/oppgaver"
        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-3xl font-black px-12 py-5 rounded-3xl border-4 border-green-700 transition-colors shadow-lg"
      >
        Start!
      </Link>
    </main>
  );
}
