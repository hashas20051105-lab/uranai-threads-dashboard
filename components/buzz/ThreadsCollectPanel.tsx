"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadCloud, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ThreadsApiStatusResult, ThreadsCollectResult } from "@/types/domain";

export function ThreadsCollectPanel({ initialStatus }: { initialStatus: ThreadsApiStatusResult }) {
  const [result, setResult] = useState<ThreadsCollectResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function collectPreviousDay() {
    setLoading(true);
    try {
      const response = await fetch("/api/buzz/collect", { method: "POST" });
      const data = (await response.json()) as ThreadsCollectResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const statusTone = initialStatus.status === "connected" ? "green" : initialStatus.status === "error" ? "rose" : "neutral";

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 4</p>
          <CardTitle className="mt-1 flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-violet-700" />
            Threads API収集
          </CardTitle>
        </div>
        <Badge tone={statusTone}>{initialStatus.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="対象キーワード数" value={result ? `${result.keywordCount}件` : "-"} />
          <Metric label="取得件数" value={result ? `${result.fetchedCount}件` : "-"} />
          <Metric label="保存件数" value={result ? `${result.savedCount}件` : "-"} />
          <Metric label="スキップ/エラー" value={result ? `${result.skippedCount} / ${result.errorCount}` : "-"} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={collectPreviousDay} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            前日投稿を収集
          </Button>
          <Link className="text-sm font-semibold text-violet-700 hover:text-violet-900" href="/import">
            手動インポートへ
          </Link>
        </div>

        {result ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-700">
              <span>対象: {formatDateTime(result.since)} - {formatDateTime(result.until)}</span>
              <span>最終収集: {formatDateTime(result.checkedAt)}</span>
              <span>状態: {result.status}</span>
            </div>
            {result.lastError ? <p className="mt-3 font-semibold text-rose-700">最終エラー: {result.lastError}</p> : null}
            {result.fallbackMessage ? (
              <p className="mt-2 text-amber-700">{result.fallbackMessage}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs leading-5 text-slate-500">
            初期対象は前日00:00〜23:59 JSTです。keyword_search が使えない場合でも、手動インポートとCSVインポートで分析を継続できます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}
