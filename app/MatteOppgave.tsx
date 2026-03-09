"use client";

import { useState } from "react";

function lagOppgave() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, svar: a + b };
}

export default function MatteOppgave() {
  const [oppgave, setOppgave] = useState(lagOppgave);
  const [input, setInput] = useState("");
  const [resultat, setResultat] = useState<"rett" | "feil" | null>(null);

  function sjekkSvar() {
    if (input === "") return;
    setResultat(Number(input) === oppgave.svar ? "rett" : "feil");
  }

  function nyOppgave() {
    setOppgave(lagOppgave());
    setInput("");
    setResultat(null);
  }

  return (
    <div
      className="mt-12 flex flex-col items-center gap-6 text-center"
      style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
    >
      <p className="text-4xl md:text-5xl font-bold text-gray-700">
        Hva er{" "}
        <span className="text-purple-500">{oppgave.a}</span>
        {" + "}
        <span className="text-green-500">{oppgave.b}</span>
        {" ?"}
      </p>

      <input
        type="number"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setResultat(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && sjekkSvar()}
        className="w-28 text-center text-4xl font-bold border-4 border-blue-300 rounded-2xl py-2 focus:outline-none focus:border-blue-500"
        placeholder="?"
        min={0}
        max={20}
      />

      {resultat === null && (
        <button
          onClick={sjekkSvar}
          className="bg-blue-400 hover:bg-blue-500 text-white text-2xl font-bold px-8 py-3 rounded-full transition-colors"
        >
          Sjekk! 🔍
        </button>
      )}

      {resultat === "rett" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-5xl md:text-6xl font-black text-green-500">
            Riktig! 🎉
          </p>
          <button
            onClick={nyOppgave}
            className="bg-green-400 hover:bg-green-500 text-white text-2xl font-bold px-8 py-3 rounded-full transition-colors"
          >
            Ny oppgave! ➡️
          </button>
        </div>
      )}

      {resultat === "feil" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-5xl md:text-6xl font-black text-red-400">
            Prøv igjen! 💪
          </p>
          <button
            onClick={nyOppgave}
            className="bg-orange-400 hover:bg-orange-500 text-white text-2xl font-bold px-8 py-3 rounded-full transition-colors"
          >
            Ny oppgave ➡️
          </button>
        </div>
      )}
    </div>
  );
}
