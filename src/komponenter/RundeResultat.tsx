interface Props {
  ferdig: boolean;
  antallRiktige: number;
  antallOppgaver: number;
  onNyRunde: () => void;
}

export function RundeResultat({
  ferdig,
  antallRiktige,
  antallOppgaver,
  onNyRunde,
}: Props) {
  if (!ferdig) return null;

  return (
    <>
      <p className="text-2xl font-black text-center text-green-700 mb-2">
        {antallRiktige} / {antallOppgaver} riktige!{" "}
        {antallRiktige === antallOppgaver ? "🎉" : "💪"}
      </p>
      <button
        onClick={onNyRunde}
        className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xl font-black px-6 py-3 rounded-2xl border-2 border-green-700 transition-colors self-start shadow"
      >
        Ny runde! 🎲
      </button>
    </>
  );
}
