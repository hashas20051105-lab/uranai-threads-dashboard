"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InsightCollectPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function collect() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/insights/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const result = await response.json();
      setMessage(`target ${result.targetCount ?? 0} / saved ${result.savedCount ?? 0} / skipped ${result.skippedCount ?? 0} / errors ${result.errorCount ?? 0}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Insight collection</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">インサイト取得</h2>
          <p className="mt-1 text-sm text-slate-500">投稿済み・承認済みの予約から、取得できる指標だけ保存します。</p>
        </div>
        <Button type="button" onClick={collect} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          まとめて取得
        </Button>
      </div>
      {message ? <p className="mt-3 rounded-md bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">{message}</p> : null}
    </section>
  );
}

