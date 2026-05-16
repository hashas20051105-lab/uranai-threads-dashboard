"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportDetail } from "@/components/reports/ReportDetail";
import type { SavedReport } from "@/types/domain";

export function ReportList({ reports }: { reports: SavedReport[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function generate(type: "daily" | "weekly") {
    setLoading(type);
    setMessage(null);
    try {
      const response = await fetch(`/api/reports/${type}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const result = await response.json();
      setMessage(response.ok ? `${type} report saved` : result.error ?? "report failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">レポート生成</h2>
            <p className="mt-1 text-sm text-slate-500">日次・週間レポートをDBに保存し、画面で確認します。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => generate("daily")} disabled={loading !== null}>
              {loading === "daily" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              日次レポート生成
            </Button>
            <Button type="button" variant="outline" onClick={() => generate("weekly")} disabled={loading !== null}>
              {loading === "weekly" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              週間レポート生成
            </Button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-violet-700">{message}</p> : null}
      </section>

      {reports.map((report) => <ReportDetail key={report.id} report={report} />)}
      {reports.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">レポートはまだありません。</div> : null}
    </div>
  );
}

