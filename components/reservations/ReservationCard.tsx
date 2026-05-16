"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Pencil, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishActionButtons } from "@/components/reservations/PublishActionButtons";
import { PublishStatusBadge } from "@/components/reservations/PublishStatusBadge";
import { PrePublishChecklist } from "@/components/reservations/PrePublishChecklist";
import type { Reservation, ReservationPostType } from "@/types/domain";

export function ReservationCard({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(reservation.scheduledAt));
  const [postType, setPostType] = useState<ReservationPostType>(reservation.postType);
  const [text, setText] = useState(reservation.text);
  const [imageUrl, setImageUrl] = useState(reservation.imageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(reservation.videoUrl ?? "");

  async function update(status?: "draft") {
    setLoading(status ?? "update");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: reservation.id,
          idea_id: reservation.ideaId,
          account_id: reservation.accountId,
          scheduled_at: new Date(scheduledAt).toISOString(),
          post_type: postType,
          text,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          thread_group_id: reservation.threadGroupId,
          thread_order: reservation.threadOrder,
          approved_by_human: status === "draft" ? false : true,
          status
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "更新に失敗しました。");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function cancel() {
    setLoading("cancel");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservation.id })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "キャンセルに失敗しました。");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={reservation.status} />
            <PublishStatusBadge reservation={reservation} />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{reservation.postType}</span>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{reservation.idea?.genre ?? "ジャンル未設定"}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarClock className="h-4 w-4 text-violet-700" />
            {formatDateTime(reservation.scheduledAt)}
          </div>
          <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{reservation.text}</p>
          <p className="mt-2 text-xs text-slate-500">
            テンプレ危険度: {reservation.idea?.templateRisk ?? "-"} / 人間味: {reservation.idea?.humanScore ?? "-"} / 承認: {reservation.approvedByHuman ? "済" : "未"}
          </p>
          <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
            <p>threads_post_id: {reservation.threadsPostId ?? "-"}</p>
            <p>posted_at: {reservation.postedAt ? formatDateTime(reservation.postedAt) : "-"}</p>
            <p>retry_count: {reservation.retryCount}</p>
            <p>last_attempted_at: {reservation.lastAttemptedAt ? formatDateTime(reservation.lastAttemptedAt) : "-"}</p>
            {reservation.lastErrorType ? <p>last_error_type: {reservation.lastErrorType}</p> : null}
            {reservation.errorMessage ? <p className="md:col-span-2 text-rose-700">error_message: {reservation.errorMessage}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing((value) => !value)}>
            <Pencil className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => update("draft")} disabled={loading !== null}>
            <RotateCcw className="mr-2 h-4 w-4" />
            下書きに戻す
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={cancel} disabled={loading !== null || reservation.status === "cancelled"}>
            {loading === "cancel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            キャンセル
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-5 space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-slate-600">予約日時</span>
              <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">投稿タイプ</span>
              <select value={postType} onChange={(event) => setPostType(event.target.value as ReservationPostType)} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {["TEXT", "IMAGE", "VIDEO", "THREAD"].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm leading-6" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="画像URL" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
            <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="動画URL" className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
          </div>
          <Button type="button" onClick={() => update()} disabled={loading !== null}>
            {loading === "update" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
            承認して更新
          </Button>
          {message ? <p className="text-sm font-semibold text-rose-700">{message}</p> : null}
        </div>
      ) : null}

      <div className="mt-5">
        <PublishActionButtons reservation={reservation} />
      </div>

      {reservation.precheckResult ? (
        <div className="mt-5">
          <PrePublishChecklist result={reservation.precheckResult} />
        </div>
      ) : null}
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "scheduled"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "cancelled"
        ? "bg-slate-100 text-slate-500 ring-slate-200"
        : status === "error"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tone}`}>{status}</span>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
