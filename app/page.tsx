"use client";

import Link from "next/link";
import { useProfil } from "@/src/komponenter/ProfilProvider";
import { Profilvelger } from "@/src/komponenter/Profilvelger";

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 py-16">
      <button
        onClick={loggUt}
        className="absolute top-4 right-4 text-base font-bold text-gray-500 hover:text-gray-700 underline"
      >
        Bytt spiller
      </button>

      <h1 className="text-center px-6 leading-tight font-black tracking-wide">
        <span className="block text-6xl md:text-8xl text-pink-500 drop-shadow-md mb-2">
          Hei
        </span>
        <span className="block text-7xl md:text-9xl text-green-500 drop-shadow-lg flex items-center justify-center gap-3">
          <span>{aktivProfil.avatar}</span>
          <span>{aktivProfil.navn}!</span>
        </span>
      </h1>
      <p className="mt-10 text-5xl">🌟🎉✨</p>
      <Link
        href="/oppgaver"
        className="mt-12 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-3xl font-black px-12 py-5 rounded-3xl border-4 border-green-700 transition-colors shadow-lg"
      >
        Start!
      </Link>
    </main>
  );
}
