import type { Experiment } from "@/types/domain";

export function ExperimentList({ experiments }: { experiments: Experiment[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">実験一覧</h2>
      <div className="mt-4 space-y-3">
        {experiments.map((experiment) => (
          <article key={experiment.id} className="rounded-md border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{experiment.status}</span>
              <span className="text-xs text-slate-500">{experiment.startDate ?? "-"} - {experiment.endDate ?? "-"}</span>
            </div>
            <h3 className="mt-2 font-bold text-slate-950">{experiment.hypothesis}</h3>
            <p className="mt-2 text-sm text-slate-600">成功指標: {experiment.successMetric ?? "-"}</p>
            <p className="mt-1 text-sm text-slate-600">結果: {experiment.result ?? "-"}</p>
            <p className="mt-1 text-sm text-slate-600">学び: {experiment.learning ?? "-"}</p>
            <p className="mt-2 text-xs text-slate-500">related reservations: {experiment.relatedReservationIds.join(", ") || "-"}</p>
          </article>
        ))}
        {experiments.length === 0 ? <p className="text-sm text-slate-500">実験はまだありません。</p> : null}
      </div>
    </section>
  );
}

