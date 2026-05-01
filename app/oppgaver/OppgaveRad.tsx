"use client";

import { type Ref } from "react";
import type { Oppgave } from "@/src/domene/typer";
import type { VisualiseringsType } from "@/src/domene/mønsterpakker";
import { TenFrame } from "@/src/komponenter/TenFrame";

interface Props {
  index: number;
  oppgave: Oppgave;
  svar: string;
  riktig: boolean | null;     // null = ikke sjekket ennå
  inputRef: Ref<HTMLInputElement | null>;
  autoFocus: boolean;
  visualiseringsType?: VisualiseringsType;
  onSvarEndret: (verdi: string) => void;
  onBlur: () => void;
  onEnter: () => void;
  onPrøvIgjen: () => void;
}

export function OppgaveRad({
  index,
  oppgave,
  svar,
  riktig,
  inputRef,
  autoFocus,
  visualiseringsType,
  onSvarEndret,
  onBlur,
  onEnter,
  onPrøvIgjen,
}: Props) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl border-2 flex-wrap ${
        riktig === true
          ? "border-green-400 bg-green-50"
          : riktig === false
          ? "border-red-300 bg-red-50"
          : "border-yellow-200 bg-white"
      }`}
    >
      <span className="text-xl font-bold text-gray-400 w-7 text-right shrink-0">
        {index + 1}.
      </span>
      <span className="text-2xl font-bold text-purple-500">{oppgave.a}</span>
      <span className="text-2xl font-bold text-gray-500">{oppgave.operasjon}</span>
      <span className="text-2xl font-bold text-green-500">{oppgave.b}</span>
      <span className="text-2xl font-bold text-gray-500">=</span>
      <input
        type="number"
        value={svar}
        onChange={(e) => onSvarEndret(e.target.value)}
        ref={inputRef}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        disabled={riktig === true}
        onClick={() => {
          if (riktig === false) onPrøvIgjen();
        }}
        autoFocus={autoFocus}
        className={`w-24 text-center text-2xl font-bold border-2 rounded-xl py-1 focus:outline-none ${
          riktig === true
            ? "border-green-400 bg-green-50"
            : riktig === false
            ? "border-red-400 bg-red-50"
            : "border-blue-300 focus:border-blue-500 bg-white"
        }`}
        placeholder="?"
      />
      {riktig === true && <span className="text-2xl shrink-0">✅</span>}
      {riktig === false && <span className="text-2xl shrink-0">❌</span>}
      {visualiseringsType === "tiervenner-utstrøk" && (
        <TenFrame total={10} krysset={oppgave.b} />
      )}
    </div>
  );
}
