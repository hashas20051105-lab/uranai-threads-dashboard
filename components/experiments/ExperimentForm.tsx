"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExperimentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        hypothesis: String(formData.get("hypothesis") ?? ""),
        startDate: String(formData.get("start_date") ?? "") || null,
        endDate: String(formData.get("end_date") ?? "") || null,
        successMetric: String(formData.get("success_metric") ?? ""),
        result: String(formData.get("result") ?? ""),
        learning: String(formData.get("learning") ?? ""),
        status: String(formData.get("status") ?? "draft"),
        relatedReservationIds: String(formData.get("related_reservation_ids") ?? "").split(",").map((value) => value.trim()).filter(Boolean)
      };
      const response = await fetch("/api/experiments/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      setMessage(response.ok ? "saved" : result.error ?? "save failed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">実験登録</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input name="hypothesis" placeholder="仮説" className="h-10 rounded-md border border-slate-200 px-3 text-sm md:col-span-2" required />
        <input name="start_date" type="date" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="end_date" type="date" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
        <input name="success_metric" placeholder="成功指標" className="h-10 rounded-md border border-slate-200 px-3 text-sm md:col-span-2" />
        <textarea name="result" placeholder="結果" rows={3} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <textarea name="learning" placeholder="学び" rows={3} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
        <select name="status" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          {["draft", "running", "done", "paused"].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input name="related_reservation_ids" placeholder="関連reservation_id（カンマ区切り）" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
      </div>
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        保存
      </Button>
      {message ? <p className="mt-3 text-sm font-semibold text-violet-700">{message}</p> : null}
    </form>
  );
}

