import type { GeneratedIdea } from "@/types/domain";

type IdeaScoreBadgesProps = {
  idea: GeneratedIdea;
};

const riskClass = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
  blocked: "bg-slate-900 text-white"
};

export function IdeaScoreBadges({ idea }: IdeaScoreBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
        AI {idea.aiScore}
      </span>
      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
        人間味 {idea.humanScore}
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskClass[idea.templateRisk]}`}>
        危険度 {idea.templateRisk}
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskClass[idea.ctaRisk]}`}>
        CTA {idea.ctaRisk}
      </span>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        鮮度 {idea.freshnessScore}
      </span>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
        類似 {idea.competitorSimilarityScore}
      </span>
    </div>
  );
}
