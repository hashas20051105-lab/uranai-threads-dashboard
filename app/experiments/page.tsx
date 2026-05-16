import { ExperimentForm } from "@/components/experiments/ExperimentForm";
import { ExperimentList } from "@/components/experiments/ExperimentList";
import { listExperiments } from "@/services/experiment-service";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const experiments = await listExperiments();
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 6</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">実験管理</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">投稿仮説、成功指標、結果、学びを手動で管理します。</p>
      </section>
      <ExperimentForm />
      <ExperimentList experiments={experiments} />
    </div>
  );
}

