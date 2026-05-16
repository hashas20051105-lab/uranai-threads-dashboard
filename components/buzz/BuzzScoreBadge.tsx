export function BuzzScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 1000
      ? "bg-violet-700 text-white"
      : score >= 500
        ? "bg-violet-50 text-violet-700"
        : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{Math.round(score).toLocaleString()}</span>;
}
