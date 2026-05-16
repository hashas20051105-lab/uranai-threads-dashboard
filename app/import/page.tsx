"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CsvImportForm } from "@/components/import/CsvImportForm";
import { ManualImportForm } from "@/components/import/ManualImportForm";
import type { BuzzImportResult } from "@/types/domain";

export default function ImportPage() {
  const [lastResult, setLastResult] = useState<BuzzImportResult | null>(null);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 3</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">手動インポート</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Threads API未接続でも、投稿URL・本文・反応数を取り込み、バズスコアと分類情報を自動補完します。
          </p>
        </div>
        <Link href="/buzz" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
          バズ調査へ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {lastResult ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          保存 {lastResult.savedCount}件 / 失敗 {lastResult.failedCount}件
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ManualImportForm onImported={setLastResult} />
        <CsvImportForm onImported={setLastResult} />
      </div>
    </div>
  );
}
