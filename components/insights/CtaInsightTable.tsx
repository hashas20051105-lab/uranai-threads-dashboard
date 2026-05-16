import type { InsightAggregate } from "@/types/domain";

export function CtaInsightTable({ data }: { data: InsightAggregate[] }) {
  return <AggregateTable title="CTA別成果" data={data} />;
}

export function AggregateTable({ title, data }: { title: string; data: InsightAggregate[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-2">
        {data.slice(0, 10).map((item) => (
          <div key={item.key} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
            <span className="truncate font-semibold text-slate-800">{item.key}</span>
            <span className="text-slate-500">{item.count}件</span>
            <span className="font-bold text-violet-700">{item.averageBuzzScore}</span>
          </div>
        ))}
        {data.length === 0 ? <p className="text-sm text-slate-500">データがありません。</p> : null}
      </div>
    </section>
  );
}

