"use client";

interface Props {
  // Hvor mange sirkler vises totalt (alltid 10 for klassisk ten-frame)
  total?: number;
  // Hvor mange er "krysset ut" — vises som blass/transparent med strek
  krysset?: number;
}

const RAD_LENGDE = 5;
const SIRKEL_RADIUS = 8;
const SPACING = 22;
const PADDING = 6;

// Klassisk ten-frame i 2 rader × 5 kolonner.
// `total` er antall sirkler (1–10).
// `krysset` er antall som er markert som "fjernet" (vist blass + strek).
export function TenFrame({ total = 10, krysset = 0 }: Props) {
  const sirkler = Math.max(0, Math.min(total, 10));
  const overstreket = Math.max(0, Math.min(krysset, sirkler));
  const kolonner = Math.min(RAD_LENGDE, sirkler);
  const rader = Math.ceil(sirkler / RAD_LENGDE);
  const bredde = PADDING * 2 + kolonner * SPACING - (SPACING - SIRKEL_RADIUS * 2);
  const høyde = PADDING * 2 + rader * SPACING - (SPACING - SIRKEL_RADIUS * 2);

  return (
    <svg
      viewBox={`0 0 ${bredde} ${høyde}`}
      className="w-24 h-auto"
      role="img"
      aria-label={`Ten-frame: ${total - overstreket} av ${total}`}
    >
      <rect
        x={1}
        y={1}
        width={bredde - 2}
        height={høyde - 2}
        fill="white"
        stroke="#78350f"
        strokeWidth={1.5}
        rx={4}
      />
      {Array.from({ length: sirkler }).map((_, i) => {
        const col = i % RAD_LENGDE;
        const row = Math.floor(i / RAD_LENGDE);
        const cx = PADDING + SIRKEL_RADIUS + col * SPACING;
        const cy = PADDING + SIRKEL_RADIUS + row * SPACING;
        const erOverstreket = i < overstreket;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={SIRKEL_RADIUS}
              fill={erOverstreket ? "#fef3c7" : "#fbbf24"}
              stroke="#78350f"
              strokeWidth={1.5}
              opacity={erOverstreket ? 0.5 : 1}
            />
            {erOverstreket && (
              <line
                x1={cx - SIRKEL_RADIUS}
                y1={cy - SIRKEL_RADIUS}
                x2={cx + SIRKEL_RADIUS}
                y2={cy + SIRKEL_RADIUS}
                stroke="#dc2626"
                strokeWidth={2}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
