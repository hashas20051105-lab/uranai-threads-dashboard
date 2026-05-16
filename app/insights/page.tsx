import { AggregateTable, CtaInsightTable } from "@/components/insights/CtaInsightTable";
import { GenreInsightChart } from "@/components/insights/GenreInsightChart";
import { InsightCollectPanel } from "@/components/insights/InsightCollectPanel";
import { ManualInsightForm } from "@/components/insights/ManualInsightForm";
import { MotifInsightTable } from "@/components/insights/MotifInsightTable";
import { PostInsightTable } from "@/components/insights/PostInsightTable";
import { PostTypeInsightChart } from "@/components/insights/PostTypeInsightChart";
import { listInsightDashboardData } from "@/services/insight-service";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const data = await listInsightDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 6</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">インサイト分析</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">投稿済みThreadsの成果を回収し、ジャンル・型・CTA・画像モチーフ別に確認します。</p>
      </section>

      <InsightCollectPanel />
      <ManualInsightForm />

      <div className="grid gap-6 xl:grid-cols-2">
        <GenreInsightChart data={data.byGenre} />
        <PostTypeInsightChart data={data.byPostType} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AggregateTable title="型別成果" data={data.byPattern} />
        <AggregateTable title="フック別成果" data={data.byHook} />
        <CtaInsightTable data={data.byCta} />
        <MotifInsightTable data={data.byMotif} />
        <AggregateTable title="人間味スコア別成果" data={data.byHumanScore} />
        <AggregateTable title="テンプレ危険度別成果" data={data.byTemplateRisk} />
      </div>

      <PostInsightTable insights={data.insights} />
    </div>
  );
}
