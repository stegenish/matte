"use client";

import { ANTALL_ETASJER, FUN_FACTS } from "@/src/domene/titler";

interface Props {
  etasje: number;
  navn: string;
}

const ETASJE_HØYDE = 28;
const ETASJE_BREDDE = 80;
const TÅRN_BREDDE = 120;
const PADDING_NEDE = 40;
const PADDING_OPPE = 30;

const ETASJE_FARGER = [
  "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b",
  "#fb923c", "#f97316", "#ea580c", "#dc2626", "#e11d48",
  "#db2777", "#c026d3", "#a855f7", "#7c3aed", "#6366f1",
];

export function Tårn({ etasje, navn }: Props) {
  // Bare faktisk åpnede etasjer rendres. Tårnet vokser fra bunnen og opp.
  const synligeEtasjer = Math.max(0, Math.min(etasje + 1, ANTALL_ETASJER));
  const harFlagg = etasje >= ANTALL_ETASJER - 1;
  const flaggHøyde = harFlagg ? 35 : 0;
  const totalHøyde = PADDING_NEDE + synligeEtasjer * ETASJE_HØYDE + flaggHøyde + PADDING_OPPE;
  const bakkeY = totalHøyde - PADDING_NEDE;
  const tårnTopp = bakkeY - synligeEtasjer * ETASJE_HØYDE;

  return (
    <figure className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${TÅRN_BREDDE} ${totalHøyde}`}
        className="w-40 md:w-52 drop-shadow-md"
        aria-label={`${navn} sitt mattetårn med ${synligeEtasjer} av ${ANTALL_ETASJER} etasjer bygget`}
      >
        {/* Bakkenivå */}
        <rect
          x={0}
          y={bakkeY + 10}
          width={TÅRN_BREDDE}
          height={PADDING_NEDE - 10}
          fill="#84cc16"
        />
        <rect
          x={0}
          y={bakkeY + 8}
          width={TÅRN_BREDDE}
          height={4}
          fill="#65a30d"
        />

        {/* Etasjer — bygges nedenfra og oppover, kun synlige rendres */}
        {Array.from({ length: synligeEtasjer }).map((_, i) => {
          const y = bakkeY - (i + 1) * ETASJE_HØYDE;
          const x = (TÅRN_BREDDE - ETASJE_BREDDE) / 2;
          const farge = ETASJE_FARGER[i] ?? "#fbbf24";
          const strokeFarge = "#78350f";
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={ETASJE_BREDDE}
                height={ETASJE_HØYDE}
                fill={farge}
                stroke={strokeFarge}
                strokeWidth={2}
                rx={3}
              />
              {/* Lite vindu */}
              <rect
                x={x + ETASJE_BREDDE / 2 - 6}
                y={y + ETASJE_HØYDE / 2 - 6}
                width={12}
                height={12}
                fill="#fef9c3"
                stroke={strokeFarge}
                strokeWidth={1.5}
                rx={1}
              />
            </g>
          );
        })}

        {/* Flagg på toppen — vises når øverste etasje er nådd */}
        {harFlagg && (
          <g>
            <line
              x1={TÅRN_BREDDE / 2}
              y1={tårnTopp}
              x2={TÅRN_BREDDE / 2}
              y2={tårnTopp - 35}
              stroke="#451a03"
              strokeWidth={2}
            />
            <polygon
              points={`${TÅRN_BREDDE / 2},${tårnTopp - 35} ${TÅRN_BREDDE / 2 + 22},${tårnTopp - 28} ${TÅRN_BREDDE / 2},${tårnTopp - 21}`}
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth={1}
            />
          </g>
        )}
      </svg>
      <figcaption className="text-center">
        <p className="text-sm font-bold text-gray-600">{navn} sitt Mattetårn</p>
        <p className="text-xs text-gray-500">
          {synligeEtasjer} / {ANTALL_ETASJER} etasjer
        </p>
      </figcaption>
    </figure>
  );
}

export function FunFactForEtasje({ etasje }: { etasje: number }) {
  const begrenset = Math.max(0, Math.min(etasje, FUN_FACTS.length - 1));
  return (
    <p className="text-sm text-gray-600 italic">💡 {FUN_FACTS[begrenset]}</p>
  );
}
