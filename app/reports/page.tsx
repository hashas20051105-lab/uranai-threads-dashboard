import { ReportList } from "@/components/reports/ReportList";
import { listReports } from "@/services/report-service";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await listReports();
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 6</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">レポート</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">日次・週間レポートと次回提案、ChatGPT貼り付け用プロンプトを保存します。</p>
      </section>
      <ReportList reports={reports} />
    </div>
  );
}

