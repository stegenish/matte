"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  antallBaller,
  antallIgjen,
  antallTattBort,
  faseFor,
  klikkBall,
  lagBallmodell,
  lagEksempelmodell,
  lagSubtraksjonsoppgave,
  type Ballmodell,
  type Subtraksjonsfase,
  type Subtraksjonsoppgave,
} from "@/src/domene/subtraksjon";
import { nøkkelForOppgave } from "@/src/domene/faktaStatus";
import { poengForOppgave } from "@/src/domene/poeng";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import { useSvarOrkestrering } from "@/src/komponenter/useSvarOrkestrering";

interface Props {
  leggTilPoeng: (poeng: number) => void;
  lagOppgave?: (maksimumA: number) => Subtraksjonsoppgave;
}

type Modus = "øv" | "eksempel";

const MAKSIMUM_VALG = [10, 20];
const EKSEMPEL_STEG_MS = 750;

export function SubtraksjonTab({
  leggTilPoeng,
  lagOppgave = lagSubtraksjonsoppgave,
}: Props) {
  const [maksimumA, setMaksimumA] = useState(10);
  const [modus, setModus] = useState<Modus>("øv");
  const [runde, setRunde] = useState(() => ({
    id: 1,
    oppgave: lagOppgave(10),
  }));
  const { streak, håndterEtt } = useSvarOrkestrering(leggTilPoeng);

  function startRunde(nyModus: Modus, maksimum = maksimumA) {
    const grense = nyModus === "eksempel" ? Math.min(maksimum, 8) : maksimum;
    setModus(nyModus);
    setRunde((forrige) => ({
      id: forrige.id + 1,
      oppgave: lagOppgave(grense),
    }));
  }

  function velgMaksimum(maksimum: number) {
    setMaksimumA(maksimum);
    startRunde(modus, maksimum);
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 gap-5 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black text-purple-700">Forstå subtraksjon</h2>
          <p className="text-gray-600 font-medium">
            Legg til, ta bort og tell hvor mange som er igjen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-gray-600 mr-1">Tall opp til</span>
          {MAKSIMUM_VALG.map((maksimum) => (
            <button
              key={maksimum}
              onClick={() => velgMaksimum(maksimum)}
              aria-pressed={maksimumA === maksimum}
              className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${
                maksimumA === maksimum
                  ? "bg-blue-500 border-blue-700 text-white"
                  : "bg-white border-blue-200 text-blue-700 hover:border-blue-500"
              }`}
            >
              {maksimum}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => startRunde("øv")}
          aria-pressed={modus === "øv"}
          className={`px-5 py-3 rounded-2xl font-black border-2 transition-colors ${
            modus === "øv"
              ? "bg-green-500 border-green-700 text-white"
              : "bg-white border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          Jeg vil prøve selv
        </button>
        <button
          onClick={() => startRunde("eksempel")}
          aria-pressed={modus === "eksempel"}
          className={`px-5 py-3 rounded-2xl font-black border-2 transition-colors ${
            modus === "eksempel"
              ? "bg-orange-500 border-orange-700 text-white"
              : "bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
          }`}
        >
          Vis eksempel
        </button>
      </div>

      {modus === "øv" ? (
        <div key={runde.id}>
          <Streakvisning streak={streak} />
          <Subtraksjonsaktivitet
            oppgave={runde.oppgave}
            kapasitet={maksimumA}
            onSvar={(erRett) =>
              håndterEtt({
                erRett,
                nøkkel: nøkkelForOppgave(runde.oppgave),
                poengVedRett: poengForOppgave(runde.oppgave),
              })
            }
            onNyOppgave={() => startRunde("øv")}
          />
        </div>
      ) : (
        <SubtraksjonsEksempel
          key={runde.id}
          oppgave={runde.oppgave}
          kapasitet={Math.min(maksimumA, 10)}
          onNyttEksempel={() => startRunde("eksempel")}
        />
      )}
    </div>
  );
}

interface AktivitetProps {
  oppgave: Subtraksjonsoppgave;
  kapasitet: number;
  onSvar: (erRett: boolean) => void;
  onNyOppgave?: () => void;
}

export function Subtraksjonsaktivitet({
  oppgave,
  kapasitet,
  onSvar,
  onNyOppgave,
}: AktivitetProps) {
  const [modell, setModell] = useState(() => lagBallmodell(kapasitet));
  const [svar, setSvar] = useState("");
  const [resultat, setResultat] = useState<boolean | null>(null);
  const svarRef = useRef<HTMLInputElement>(null);
  const fase = faseFor(modell, oppgave);

  useEffect(() => {
    if (fase === "svar") svarRef.current?.focus();
  }, [fase]);

  function kontrollerSvar() {
    if (fase !== "svar" || svar === "" || resultat !== null) return;
    const erRett = Number(svar) === oppgave.svar;
    setResultat(erRett);
    onSvar(erRett);
  }

  return (
    <div className="mt-4 flex flex-col gap-4 w-full max-w-2xl">
      <Ballarbeidsflate
        oppgave={oppgave}
        visSvar={resultat === true}
        modell={modell}
        fase={fase}
        onKlikk={
          resultat === true
            ? undefined
            : (index) => {
                setResultat(null);
                setModell((forrige) => klikkBall(forrige, index, oppgave));
              }
        }
      >
        <Faseforklaring fase={fase} modell={modell} oppgave={oppgave} />
      </Ballarbeidsflate>

      <Addisjonssjekk oppgave={oppgave} visSvar={resultat === true} />

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-lg font-black text-gray-700">
          Hvor mange har jeg igjen?
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={svarRef}
              type="number"
              min={0}
              value={svar}
              disabled={fase !== "svar" || resultat === true}
              onChange={(event) => {
                setSvar(event.target.value);
                setResultat(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") kontrollerSvar();
              }}
              className="w-28 text-center text-3xl font-black border-4 border-blue-300 focus:border-blue-600 rounded-2xl py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none"
              placeholder="?"
            />
            <button
              onClick={kontrollerSvar}
              disabled={fase !== "svar" || svar === "" || resultat !== null}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-lg font-black px-6 py-3 rounded-2xl border-2 border-blue-700 disabled:border-gray-400"
            >
              Sjekk svaret
            </button>
          </div>
        </label>

        {resultat === false && (
          <p role="alert" className="font-bold text-red-600">
            Ikke helt ennå. Tell ballene som ikke er krysset ut, og prøv igjen.
          </p>
        )}
        {resultat === true && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-2xl font-black text-green-700">
              Ja! {oppgave.svar} baller er igjen 🎉
            </p>
            {onNyOppgave && (
              <button
                onClick={onNyOppgave}
                className="bg-green-500 hover:bg-green-600 text-white font-black px-5 py-3 rounded-2xl border-2 border-green-700"
              >
                Ny oppgave
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Faseforklaring({
  fase,
  modell,
  oppgave,
}: {
  fase: Subtraksjonsfase;
  modell: Ballmodell;
  oppgave: Subtraksjonsoppgave;
}) {
  if (fase === "legg-til") {
    return (
      <div className="rounded-2xl bg-purple-50 border-2 border-purple-200 p-4">
        <p className="text-xl font-black text-purple-700">Hvor mange har jeg?</p>
        <p className="font-bold text-gray-700">
          Legg {oppgave.a} baller i samlingen: {antallBaller(modell)} / {oppgave.a}
        </p>
      </div>
    );
  }
  if (fase === "ta-bort") {
    return (
      <div className="rounded-2xl bg-orange-50 border-2 border-orange-200 p-4">
        <p className="text-xl font-black text-orange-700">Hvor mange tar jeg bort?</p>
        <p className="font-bold text-gray-700">
          Kryss ut {oppgave.b} baller: {antallTattBort(modell)} / {oppgave.b}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
      <p className="text-xl font-black text-green-700">Hvor mange har jeg igjen?</p>
      <p className="font-bold text-gray-700">
        Tell ballene uten kryss. Du startet med {oppgave.a} og tok bort {oppgave.b}.
      </p>
    </div>
  );
}

function Subtraksjonsuttrykk({
  oppgave,
  visSvar,
}: {
  oppgave: Subtraksjonsoppgave;
  visSvar: boolean;
}) {
  const svar = visSvar ? oppgave.svar : "?";
  return (
    <p className="text-4xl sm:text-5xl font-black text-purple-700 text-center">
      {oppgave.a} − {oppgave.b} = {svar}
    </p>
  );
}

function Addisjonssjekk({
  oppgave,
  visSvar,
}: {
  oppgave: Subtraksjonsoppgave;
  visSvar: boolean;
}) {
  const svar = visSvar ? oppgave.svar : "?";
  return (
    <p
      role="note"
      aria-label="Sjekk med addisjon"
      className="text-sm font-bold text-gray-500 pl-1"
    >
      Sjekk med pluss: {oppgave.b} + {svar} = {oppgave.a}
    </p>
  );
}

interface RutenettProps {
  modell: Ballmodell;
  fase: Subtraksjonsfase;
  onKlikk?: (index: number) => void;
  pekerIndex?: number | null;
}

interface BallarbeidsflateProps extends RutenettProps {
  oppgave: Subtraksjonsoppgave;
  visSvar: boolean;
  children: ReactNode;
}

function Ballarbeidsflate({
  oppgave,
  visSvar,
  modell,
  fase,
  onKlikk,
  pekerIndex,
  children,
}: BallarbeidsflateProps) {
  return (
    <section
      role="group"
      aria-label="Subtraksjonen med baller"
      className="flex flex-col items-center gap-4 rounded-3xl border-4 border-blue-200 bg-blue-50/40 p-4 sm:p-6"
    >
      <Subtraksjonsuttrykk oppgave={oppgave} visSvar={visSvar} />
      <div className="w-full">{children}</div>
      <Ballerutenett
        modell={modell}
        fase={fase}
        onKlikk={onKlikk}
        pekerIndex={pekerIndex}
      />
    </section>
  );
}

function Ballerutenett({
  modell,
  fase,
  onKlikk,
  pekerIndex = null,
}: RutenettProps) {
  return (
    <div className="relative w-fit max-w-full">
      <div className="grid grid-cols-5 gap-1 sm:gap-2 rounded-3xl border-4 border-blue-200 bg-blue-50 p-2 sm:p-3">
        {modell.baller.map((ball, index) => {
          const nummer = index + 1;
          const kanKlikkes = Boolean(onKlikk) && kanEndreBall(ball, fase);
          const label = !kanKlikkes
            ? ball === "tom"
              ? `Tom rute ${nummer}`
              : ball === "borte"
                ? `Ball ${nummer}, tatt bort`
                : `Ball ${nummer}, igjen`
            : ball === "tom"
              ? `Tom rute ${nummer}, klikk for å legge til ball`
              : ball === "borte"
                ? `Ball ${nummer}, tatt bort. Klikk for å angre`
                : fase === "legg-til"
                  ? `Ball ${nummer}, klikk for å fjerne`
                  : `Ball ${nummer}, klikk for å ta bort`;
          return (
            <button
              key={index}
              type="button"
              aria-label={label}
              disabled={!kanKlikkes}
              onClick={() => onKlikk?.(index)}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-blue-200 bg-white disabled:opacity-100 flex items-center justify-center enabled:hover:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200"
            >
              {ball !== "tom" && (
                <span
                  aria-hidden="true"
                  className={`text-3xl transition-all ${
                    ball === "borte" ? "opacity-35 grayscale" : ""
                  }`}
                >
                  🔵
                </span>
              )}
              {ball === "borte" && (
                <span
                  aria-hidden="true"
                  className="absolute text-4xl font-black text-red-600 leading-none"
                >
                  ×
                </span>
              )}
              {pekerIndex === index && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 text-3xl z-10 drop-shadow-lg animate-bounce pointer-events-none"
                >
                  🖱️
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function kanEndreBall(
  ball: Ballmodell["baller"][number],
  fase: Subtraksjonsfase,
): boolean {
  if (fase === "legg-til") return ball === "tom" || ball === "igjen";
  if (fase === "ta-bort") return ball === "igjen" || ball === "borte";
  return ball === "borte";
}

function SubtraksjonsEksempel({
  oppgave,
  kapasitet,
  onNyttEksempel,
}: {
  oppgave: Subtraksjonsoppgave;
  kapasitet: number;
  onNyttEksempel: () => void;
}) {
  const [steg, setSteg] = useState(0);
  const antallHandlinger = oppgave.a + oppgave.b;
  const ferdig = steg > antallHandlinger;
  const lagtTil = Math.min(steg, oppgave.a);
  const tattBort = Math.max(0, Math.min(steg - oppgave.a, oppgave.b));
  const modell = lagEksempelmodell(kapasitet, oppgave, steg);
  const pekerIndex = ferdig
    ? null
    : steg < oppgave.a
      ? steg
      : steg < antallHandlinger
        ? steg - oppgave.a
        : null;

  useEffect(() => {
    const timere = Array.from({ length: antallHandlinger + 1 }, (_, index) =>
      window.setTimeout(() => setSteg(index + 1), (index + 1) * EKSEMPEL_STEG_MS),
    );
    return () => timere.forEach((timer) => window.clearTimeout(timer));
  }, [antallHandlinger]);

  const fase: Subtraksjonsfase =
    lagtTil < oppgave.a ? "legg-til" : tattBort < oppgave.b ? "ta-bort" : "svar";

  return (
    <div className="mt-2 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-orange-800 bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-3">
          Se på musepekeren: først legger den til {oppgave.a} baller, så tar den bort {oppgave.b}.
        </p>
        <button
          onClick={onNyttEksempel}
          className="bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-3 rounded-2xl border-2 border-orange-700"
        >
          Nytt eksempel
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <Ballarbeidsflate
          oppgave={oppgave}
          visSvar={ferdig}
          modell={modell}
          fase={fase}
          pekerIndex={pekerIndex}
        >
          <p className="text-xl font-black text-purple-700" aria-live="polite">
            {ferdig
              ? `${antallIgjen(modell)} baller er igjen.`
              : fase === "legg-til"
                ? `Legger til ball ${lagtTil + 1} av ${oppgave.a}.`
                : fase === "ta-bort"
                  ? `Tar bort ball ${tattBort + 1} av ${oppgave.b}.`
                : "Teller ballene som er igjen …"}
          </p>
        </Ballarbeidsflate>
        <Addisjonssjekk oppgave={oppgave} visSvar={ferdig} />
        <p className="font-bold text-gray-600">
          Eksempler gir ikke poeng. De er bare til for å se og forstå.
        </p>
      </div>
    </div>
  );
}
