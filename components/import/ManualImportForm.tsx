"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { BuzzImportResult } from "@/types/domain";

const initialForm = {
  post_url: "",
  author_username: "",
  post_text: "",
  posted_at: "",
  like_count: "0",
  reply_count: "0",
  repost_count: "0",
  quote_count: "0",
  view_count: "0",
  memo: ""
};

type Props = {
  onImported: (result: BuzzImportResult) => void;
};

export function ManualImportForm({ onImported }: Props) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/buzz/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual", post: form })
      });
      const result = (await response.json()) as BuzzImportResult;
      if (!response.ok) throw new Error(result.errors?.[0] ?? "import failed");
      onImported(result);
      setForm(initialForm);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">単発入力</h2>
      <p className="mt-1 text-sm text-slate-500">Threads APIは使わず、手元で確認した投稿情報を保存します。</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Input label="投稿URL" value={form.post_url} onChange={(value) => update("post_url", value)} placeholder="https://www.threads.net/..." />
        <Input label="投稿者" value={form.author_username} onChange={(value) => update("author_username", value)} placeholder="@account_name" />
        <Input label="投稿日時" type="datetime-local" value={form.posted_at} onChange={(value) => update("posted_at", value)} />
        <Input label="メモ" value={form.memo} onChange={(value) => update("memo", value)} placeholder="取得経路や補足" />
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-xs font-semibold text-slate-600">投稿本文</span>
        <textarea
          value={form.post_text}
          onChange={(event) => update("post_text", event.target.value)}
          rows={6}
          className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="投稿本文を貼り付け"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input label="いいね" type="number" value={form.like_count} onChange={(value) => update("like_count", value)} />
        <Input label="返信" type="number" value={form.reply_count} onChange={(value) => update("reply_count", value)} />
        <Input label="リポスト" type="number" value={form.repost_count} onChange={(value) => update("repost_count", value)} />
        <Input label="引用" type="number" value={form.quote_count} onChange={(value) => update("quote_count", value)} />
        <Input label="表示回数" type="number" value={form.view_count} onChange={(value) => update("view_count", value)} />
      </div>

      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={loading || !form.post_text.trim()}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {loading ? "保存中" : "保存する"}
      </button>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}
