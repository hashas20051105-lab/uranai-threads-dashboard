import { ArrowRight, CheckCircle2 } from "lucide-react";
import { recommendedIdeas } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type RecommendedIdeasProps = {
  ideas: typeof recommendedIdeas;
};

export function RecommendedIdeas({ ideas }: RecommendedIdeasProps) {
  return (
    <SectionCard title="本日のおすすめ投稿案" description="投稿実行はせず、Phase 1では候補カードのみ表示します。">
      <div className="space-y-3">
        {ideas.map((idea) => (
          <article key={idea.title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">{idea.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {idea.genre} / {idea.type}
                </p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-violet-700">
                {idea.score}
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-600">{idea.note}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                テンプレ危険度: {idea.risk}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                予約はPhase 5
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
