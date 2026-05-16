"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManualInsightForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const reservationId = String(formData.get("reservation_id") ?? "").trim();
      const manualMetrics = {
        view_count: numberOrNull(formData.get("view_count")),
        like_count: numberOrNull(formData.get("like_count")),
        reply_count: numberOrNull(formData.get("reply_count")),
        repost_count: numberOrNull(formData.get("repost_count")),
        quote_count: numberOrNull(formData.get("quote_count")),
        memo: String(formData.get("memo") ?? "")
      };
      const response = await fetch("/api/insights/collect-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservationId, manual_metrics: manualMetrics })
      });
      const result = await response.json();
      setMessage(response.ok ? `saved ${result.savedCount ?? 0}` : result.error ?? result.errors?.[0] ?? "保存に失敗しました");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">手動インサイト補正</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input name="reservation_id" placeholder="reservation_id" className="h-10 rounded-md border border-slate-200 px-3 text-sm md:col-span-3" required />
        {["view_count", "like_count", "reply_count", "repost_count", "quote_count"].map((name) => (
          <input key={name} name={name} placeholder={name} type="number" min="0" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
        ))}
        <input name="memo" placeholder="memo" className="h-10 rounded-md border border-slate-200 px-3 text-sm md:col-span-3" />
      </div>
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        手動保存
      </Button>
      {message ? <p className="mt-3 text-sm font-semibold text-violet-700">{message}</p> : null}
    </form>
  );
}

function numberOrNull(value: FormDataEntryValue | null) {
  const number = Number(value);
  return Number.isFinite(number) && String(value ?? "").trim() !== "" ? number : null;
}

