"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle, RotateCcw, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmThreadsPublish } from "@/components/reservations/PublishConfirmDialog";
import type { PublishActionResult, Reservation } from "@/types/domain";

export function PublishActionButtons({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<PublishActionResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runDryRun() {
    setLoading("dry-run");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/publish-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservation.id, dry_run: true })
      });
      const data = (await response.json()) as PublishActionResult;
      setResult(data);
      if (!response.ok) setMessage(data.error ?? "dry-run failed");
    } finally {
      setLoading(null);
    }
  }

  async function publishNow() {
    if (!confirmThreadsPublish()) return;
    setLoading("publish");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/publish-one", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publish-confirmation": "human-confirmed" },
        body: JSON.stringify({ reservation_id: reservation.id, dry_run: false })
      });
      const data = (await response.json()) as PublishActionResult;
      setResult(data);
      if (!response.ok) setMessage(data.error ?? "publish failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function clearError() {
    setLoading("clear-error");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservation.id, mode: "clear_error" })
      });
      const data = await response.json();
      if (!response.ok) setMessage(data.error ?? "clear error failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const disabled = loading !== null || Boolean(reservation.threadsPostId) || reservation.status === "cancelled" || reservation.status === "posted";

  return (
    <div className="space-y-3 rounded-lg border border-violet-100 bg-violet-50/40 p-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={runDryRun} disabled={loading !== null || Boolean(reservation.threadsPostId)}>
          {loading === "dry-run" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
          dry-run
        </Button>
        <Button type="button" size="sm" onClick={publishNow} disabled={disabled}>
          {loading === "publish" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
          今すぐ投稿
        </Button>
        {reservation.status === "error" ? (
          <Button type="button" size="sm" variant="outline" onClick={clearError} disabled={loading !== null || Boolean(reservation.threadsPostId)}>
            {loading === "clear-error" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            エラー解除
          </Button>
        ) : null}
        {reservation.status === "error" ? (
          <Button type="button" size="sm" variant="outline" onClick={clearError} disabled={loading !== null || Boolean(reservation.threadsPostId)}>
            <Wand2 className="mr-2 h-4 w-4" />
            再予約
          </Button>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-md bg-white p-3 text-xs text-slate-700 ring-1 ring-violet-100">
          <p className="font-bold text-slate-900">dry-run / publish result: {result.status ?? (result.ok ? "ok" : "error")}</p>
          {result.error ? <p className="mt-1 text-rose-700">{result.error}</p> : null}
          {result.target ? (
            <ul className="mt-2 space-y-1">
              <li>final check: {result.target.finalCheck.overallStatus}</li>
              <li>can publish: {result.target.finalCheck.canPublish ? "yes" : "no"}</li>
              <li>blocking reasons: {result.target.finalCheck.blockingReasons.length || 0}</li>
            </ul>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="text-xs font-semibold text-rose-700">{message}</p> : null}
    </div>
  );
}

