"use client";

import { STREAK_GRENSE, type StreakTilstand } from "@/src/domene/streak";

export function Streakvisning({ streak }: { streak: StreakTilstand }) {
  if (streak.riktigPåRad === 0) return null;
  const erEkteStreak = streak.riktigPåRad >= STREAK_GRENSE;
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <span
        className={`text-xl font-black ${erEkteStreak ? "text-orange-500" : "text-gray-500"}`}
      >
        {erEkteStreak ? "🔥" : "✨"} ×{streak.riktigPåRad}
      </span>
      {erEkteStreak && streak.skjoldIntakt && (
        <span
          className="text-xl"
          title="Skjoldet beskytter streaken din mot første feil"
          aria-label="Skjold aktivt"
        >
          🛡
        </span>
      )}
    </div>
  );
}
