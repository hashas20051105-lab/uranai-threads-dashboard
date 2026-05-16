import { hookRanking } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type HookRankingProps = {
  hooks: typeof hookRanking;
};

export function HookRanking({ hooks }: HookRankingProps) {
  return (
    <SectionCard title="伸びたフックTOP10" description="使い回し防止のため、使用回数も並べて確認します。">
      <div className="space-y-2">
        {hooks.map((hook) => (
          <div key={hook.rank} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-50">
            <span className="text-sm font-bold text-slate-400">{hook.rank}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{hook.hook}</p>
              <p className="text-xs text-slate-500">使用 {hook.uses}回</p>
            </div>
            <span className="text-sm font-bold text-slate-950">{hook.averageScore}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
