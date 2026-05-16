"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ThreadsApiStatusResult } from "@/types/domain";

type KeywordSearchResult =
  | { ok: true; keyword: string; fetchedCount: number; samples: Array<{ textPreview: string; authorUsername: string | null }> }
  | { ok: false; status: string; message: string; fallbackMessage?: string };

export function ThreadsApiSettingsCard({ initialStatus }: { initialStatus: ThreadsApiStatusResult }) {
  const [status, setStatus] = useState(initialStatus);
  const [keywordResult, setKeywordResult] = useState<KeywordSearchResult | null>(null);
  const [loading, setLoading] = useState<"test" | "keyword" | null>(null);

  async function runConnectionTest() {
    setLoading("test");
    try {
      const response = await fetch("/api/threads/test", { method: "POST" });
      const result = (await response.json()) as ThreadsApiStatusResult;
      setStatus(result);
    } finally {
      setLoading(null);
    }
  }

  async function runKeywordTest() {
    setLoading("keyword");
    try {
      const response = await fetch("/api/threads/keyword-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: "占い" })
      });
      const result = (await response.json()) as KeywordSearchResult;
      setKeywordResult(result);
    } finally {
      setLoading(null);
    }
  }

  const connected = status.status === "connected";

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 4</p>
          <CardTitle className="mt-1 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-violet-700" />
            Threads API設定
          </CardTitle>
        </div>
        <Badge tone={connected ? "green" : status.status === "error" ? "rose" : "neutral"}>
          {connected ? "connected" : status.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 md:grid-cols-3">
          <StatusItem label="Access Token" configured={status.accessTokenConfigured} value={status.accessTokenConfigured ? "設定済み" : "未設定"} />
          <StatusItem label="User ID" configured={status.userIdConfigured} value={status.maskedUserId ?? "未設定"} />
          <StatusItem label="最終確認" configured={connected} value={formatDateTime(status.checkedAt)} />
        </div>

        {status.message ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{status.message}</div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={runConnectionTest} disabled={loading !== null}>
            {loading === "test" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            API接続テスト
          </Button>
          <Button type="button" variant="outline" onClick={runKeywordTest} disabled={loading !== null}>
            {loading === "keyword" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            keyword_search テスト
          </Button>
        </div>

        {keywordResult ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            {keywordResult.ok ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">keyword_search 結果: {keywordResult.fetchedCount}件</p>
                <div className="space-y-2">
                  {keywordResult.samples.length > 0 ? (
                    keywordResult.samples.map((sample, index) => (
                      <p key={`${sample.authorUsername}-${index}`} className="text-xs leading-5 text-slate-600">
                        {sample.authorUsername ? `@${sample.authorUsername}: ` : ""}
                        {sample.textPreview}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">取得は成功しましたが、対象期間のサンプル投稿はありませんでした。</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-3 text-sm text-rose-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">{keywordResult.message}</p>
                  <p className="mt-1 text-xs text-rose-600">{keywordResult.fallbackMessage}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <p className="text-xs leading-5 text-slate-500">
          Access TokenとApp Secretの値そのものは画面に表示しません。Phase 1〜6では環境変数をサーバー側で読み取り、DBにはsecret平文を保存しません。
        </p>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, configured, value }: { label: string; configured: boolean; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
        {configured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-400" />}
        {value}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}
