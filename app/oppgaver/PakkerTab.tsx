"use client";

import { useState } from "react";
import OppgaveListe from "./OppgaveListe";
import type { Oppgave } from "@/src/domene/typer";
import {
  FORHÅNDS_PAKKER,
  lagEgenPakke,
  type Mønsterpakke,
} from "@/src/domene/mønsterpakker";
import { useGenerertRunde } from "@/src/komponenter/useOppgaverunde";

interface Props {
  leggTilPoeng: (p: number) => void;
}

export function PakkerTab({ leggTilPoeng }: Props) {
  const [valgtPakke, setValgtPakke] = useState<Mønsterpakke | null>(null);
  const { runde, startRunde } = useGenerertRunde<Oppgave>();
  const { id: rundeId, oppgaver } = runde;
  const [viserEgenForm, setViserEgenForm] = useState(false);

  function velgPakke(pakke: Mønsterpakke) {
    setValgtPakke(pakke);
    startRunde(pakke.generer());
    setViserEgenForm(false);
  }

  function nyRunde() {
    if (valgtPakke) startRunde(valgtPakke.generer());
  }

  return (
    <section className="flex-1 p-6 overflow-y-auto">
      <div className="flex flex-col gap-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-black text-gray-700 mb-3">Velg en pakke</h2>
          <div className="flex flex-wrap gap-3">
            {FORHÅNDS_PAKKER.map((p) => (
              <PakkeKort
                key={p.id}
                pakke={p}
                aktiv={valgtPakke?.id === p.id}
                onClick={() => velgPakke(p)}
              />
            ))}
            <button
              onClick={() => setViserEgenForm((v) => !v)}
              className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-4 transition-colors w-56 text-left ${
                viserEgenForm
                  ? "border-purple-500 bg-purple-50"
                  : "border-dashed border-gray-300 bg-white hover:border-purple-400"
              }`}
            >
              <span className="text-lg font-black text-purple-600">+ Egen pakke</span>
              <span className="text-sm text-gray-600">Velg startall og steg selv</span>
            </button>
          </div>
        </div>

        {viserEgenForm && (
          <EgenPakkeForm
            onLagre={(pakke) => {
              velgPakke(pakke);
            }}
          />
        )}

        {valgtPakke && oppgaver.length > 0 && (
          <div className="border-t-2 border-yellow-200 pt-4">
            <h3 className="text-lg font-black text-purple-600 mb-3">
              {valgtPakke.navn}
            </h3>
            <OppgaveListe
              key={rundeId}
              oppgaver={oppgaver}
              leggTilPoeng={leggTilPoeng}
              onNyRunde={nyRunde}
              visualiseringsType={valgtPakke.visualiseringsType}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function PakkeKort({
  pakke,
  aktiv,
  onClick,
}: {
  pakke: Mønsterpakke;
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-4 transition-colors w-56 text-left ${
        aktiv
          ? "border-green-500 bg-green-50"
          : "border-yellow-300 bg-white hover:border-green-400"
      }`}
    >
      <span className="text-lg font-black text-purple-600">{pakke.navn}</span>
      <span className="text-sm text-gray-600">{pakke.beskrivelse}</span>
    </button>
  );
}

function EgenPakkeForm({ onLagre }: { onLagre: (pakke: Mønsterpakke) => void }) {
  const [start, setStart] = useState(8);
  const [steg, setSteg] = useState(2);
  const [antall, setAntall] = useState(10);

  const kanLagre = Number.isFinite(start) && Number.isFinite(steg) && steg > 0;

  return (
    <div className="bg-white border-2 border-yellow-300 rounded-2xl p-4 max-w-md">
      <p className="text-base font-bold text-gray-700 mb-3">
        Egen pakke: {start} + {steg}, {start + steg} + {steg}, …
      </p>
      <div className="flex flex-wrap gap-3 mb-3">
        <NumerInput label="Start" verdi={start} onChange={setStart} />
        <NumerInput label="Steg" verdi={steg} onChange={setSteg} min={1} />
        <NumerInput label="Antall" verdi={antall} onChange={setAntall} min={1} max={20} />
      </div>
      <button
        onClick={() => kanLagre && onLagre(lagEgenPakke(start, steg, antall))}
        disabled={!kanLagre}
        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-lg font-black px-5 py-2 rounded-xl border-2 border-green-700 disabled:border-gray-400 transition-colors"
      >
        Lag pakke
      </button>
    </div>
  );
}

function NumerInput({
  label,
  verdi,
  onChange,
  min,
  max,
}: {
  label: string;
  verdi: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <input
        type="number"
        value={verdi}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-20 text-center text-xl font-bold border-2 border-blue-300 rounded-xl py-1 focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}
