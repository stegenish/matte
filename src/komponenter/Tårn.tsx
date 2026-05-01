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
const PADDING_OPPE = 50;

const ETASJE_FARGER = [
  "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b",
  "#fb923c", "#f97316", "#ea580c", "#dc2626", "#e11d48",
  "#db2777", "#c026d3", "#a855f7", "#7c3aed", "#6366f1",
];

export function Tårn({ etasje, navn }: Props) {
  const totalHøyde = PADDING_NEDE + ANTALL_ETASJER * ETASJE_HØYDE + PADDING_OPPE;

  return (
    <figure className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${TÅRN_BREDDE} ${totalHøyde}`}
        className="w-40 md:w-52 drop-shadow-md"
        aria-label={`${navn} sitt mattetårn med ${etasje + 1} av ${ANTALL_ETASJER} etasjer synlige`}
      >
        {/* Bakkenivå */}
        <rect
          x={0}
          y={totalHøyde - PADDING_NEDE + 10}
          width={TÅRN_BREDDE}
          height={PADDING_NEDE - 10}
          fill="#84cc16"
        />
        <rect
          x={0}
          y={totalHøyde - PADDING_NEDE + 8}
          width={TÅRN_BREDDE}
          height={4}
          fill="#65a30d"
        />

        {/* Etasjer — bygges nedenfra og oppover */}
        {Array.from({ length: ANTALL_ETASJER }).map((_, i) => {
          const synlig = i <= etasje;
          const y = totalHøyde - PADDING_NEDE - (i + 1) * ETASJE_HØYDE;
          const x = (TÅRN_BREDDE - ETASJE_BREDDE) / 2;
          const farge = synlig ? ETASJE_FARGER[i] ?? "#fbbf24" : "#e5e7eb";
          const strokeFarge = synlig ? "#78350f" : "#9ca3af";
          return (
            <g key={i} opacity={synlig ? 1 : 0.45}>
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
                fill={synlig ? "#fef9c3" : "#d1d5db"}
                stroke={strokeFarge}
                strokeWidth={1.5}
                rx={1}
              />
            </g>
          );
        })}

        {/* Flagg på toppen — vises når øverste etasje er nådd */}
        {etasje >= ANTALL_ETASJER - 1 && (
          <g>
            <line
              x1={TÅRN_BREDDE / 2}
              y1={totalHøyde - PADDING_NEDE - ANTALL_ETASJER * ETASJE_HØYDE}
              x2={TÅRN_BREDDE / 2}
              y2={totalHøyde - PADDING_NEDE - ANTALL_ETASJER * ETASJE_HØYDE - 35}
              stroke="#451a03"
              strokeWidth={2}
            />
            <polygon
              points={`${TÅRN_BREDDE / 2},${totalHøyde - PADDING_NEDE - ANTALL_ETASJER * ETASJE_HØYDE - 35} ${TÅRN_BREDDE / 2 + 22},${totalHøyde - PADDING_NEDE - ANTALL_ETASJER * ETASJE_HØYDE - 28} ${TÅRN_BREDDE / 2},${totalHøyde - PADDING_NEDE - ANTALL_ETASJER * ETASJE_HØYDE - 21}`}
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
          {etasje + 1} / {ANTALL_ETASJER} etasjer
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
