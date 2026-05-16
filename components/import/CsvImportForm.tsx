"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import type { BuzzImportResult } from "@/types/domain";

const sampleCsv = `post_url,author_username,post_text,posted_at,like_count,reply_count,repost_count,quote_count,view_count,memo
https://www.threads.net/@sample/post/1,@sample_fortune,"今日の運勢。朝の空が明るく見えた人は、焦らず整える日。保存してあとで見返してください。",2026-05-13T08:00,120,18,12,4,3200,手動確認`;

type Props = {
  onImported: (result: BuzzImportResult) => void;
};

export function CsvImportForm({ onImported }: Props) {
  const [csvText, setCsvText] = useState(sampleCsv);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/buzz/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "csv", csvText })
      });
      const result = (await response.json()) as BuzzImportResult;
      if (!response.ok) throw new Error(result.errors?.[0] ?? "import failed");
      onImported(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CSV保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">CSV貼り付け</h2>
      <p className="mt-1 text-sm text-slate-500">1行目をヘッダーとして扱います。不足項目があっても可能な範囲で保存します。</p>
      <textarea
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        rows={10}
        className="mt-5 w-full resize-y rounded-md border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />

      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={loading || !csvText.trim()}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileUp className="h-4 w-4" />
        {loading ? "取り込み中" : "CSVを取り込む"}
      </button>
    </section>
  );
}
