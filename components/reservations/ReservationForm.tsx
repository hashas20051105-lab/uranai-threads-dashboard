"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HumanApprovalBox } from "@/components/reservations/HumanApprovalBox";
import { PostPreview } from "@/components/reservations/PostPreview";
import { PrePublishChecklist } from "@/components/reservations/PrePublishChecklist";
import type { PrePublishCheckResult, ReservationCandidateIdea, ReservationInput, ReservationPostType } from "@/types/domain";

const postTypes: ReservationPostType[] = ["TEXT", "IMAGE", "VIDEO", "THREAD"];

export function ReservationForm({ ideas, initialIdeaId }: { ideas: ReservationCandidateIdea[]; initialIdeaId?: string }) {
  const router = useRouter();
  const firstIdea = ideas.find((idea) => idea.id === initialIdeaId) ?? ideas[0];
  const [ideaId, setIdeaId] = useState(firstIdea?.id ?? "");
  const selectedIdea = useMemo(() => ideas.find((idea) => idea.id === ideaId) ?? firstIdea, [ideaId, ideas, firstIdea]);
  const [scheduledAt, setScheduledAt] = useState(defaultDateTimeLocal());
  const [postType, setPostType] = useState<ReservationPostType>("TEXT");
  const [text, setText] = useState(selectedIdea?.fullText ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [threadGroupId, setThreadGroupId] = useState("");
  const [threadOrder, setThreadOrder] = useState("1");
  const [approved, setApproved] = useState(false);
  const [precheck, setPrecheck] = useState<PrePublishCheckResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"preview" | "create" | null>(null);

  function handleIdeaChange(nextIdeaId: string) {
    setIdeaId(nextIdeaId);
    const nextIdea = ideas.find((idea) => idea.id === nextIdeaId);
    setText(nextIdea?.fullText ?? "");
    setPrecheck(null);
    setMessage(null);
  }

  function buildInput(): ReservationInput {
    return {
      idea_id: ideaId,
      account_id: selectedIdea?.accountId ?? null,
      scheduled_at: new Date(scheduledAt).toISOString(),
      post_type: postType,
      text,
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      thread_group_id: postType === "THREAD" ? threadGroupId.trim() || null : null,
      thread_order: postType === "THREAD" ? Number(threadOrder) || 1 : null,
      approved_by_human: approved
    };
  }

  async function runPreview() {
    setLoading("preview");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildInput(), preview_only: true })
      });
      const result = await response.json();
      if (result.precheck) setPrecheck(result.precheck);
      if (!response.ok) setMessage(result.error ?? "投稿前チェックに失敗しました。");
    } finally {
      setLoading(null);
    }
  }

  async function createReservation() {
    setLoading("create");
    setMessage(null);
    try {
      const response = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildInput())
      });
      const result = await response.json();
      if (result.precheck) setPrecheck(result.precheck);
      if (!response.ok) {
        setMessage(result.error ?? "予約作成に失敗しました。");
        return;
      }
      setMessage(approved ? "予約を scheduled として保存しました。" : "未承認の予約を pending_approval として保存しました。");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (ideas.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-800">予約できる投稿案がありません。</p>
        <p className="mt-2 text-xs text-slate-500">投稿案生成ページで「採用」または「修正」にした投稿案が予約対象です。</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-violet-700" />
        <h2 className="text-lg font-bold text-slate-950">投稿案から予約作成</h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-600">投稿案</span>
            <select value={ideaId} onChange={(event) => handleIdeaChange(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.genre} / {idea.postType} / {idea.hook}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-slate-600">予約日時</span>
              <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">投稿タイプ</span>
              <select value={postType} onChange={(event) => setPostType(event.target.value as ReservationPostType)} className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {postTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-slate-600">投稿本文</span>
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={8} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm leading-6" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-slate-600">画像URL</span>
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">動画URL</span>
              <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://..." className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
          </div>

          {postType === "THREAD" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">thread_group_id</span>
                <input value={threadGroupId} onChange={(event) => setThreadGroupId(event.target.value)} placeholder="未入力なら次Phaseで生成" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">thread_order</span>
                <input type="number" min="1" value={threadOrder} onChange={(event) => setThreadOrder(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
          ) : null}

          <HumanApprovalBox approved={approved} onChange={setApproved} />

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={runPreview} disabled={loading !== null}>
              {loading === "preview" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              投稿前チェック
            </Button>
            <Button type="button" onClick={createReservation} disabled={loading !== null || !approved}>
              {loading === "create" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
              予約する
            </Button>
          </div>

          {message ? <p className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{message}</p> : null}
        </div>

        <div className="space-y-4">
          <PostPreview text={text} postType={postType} imageUrl={imageUrl} videoUrl={videoUrl} />
          <PrePublishChecklist result={precheck} />
        </div>
      </div>
    </section>
  );
}

function defaultDateTimeLocal() {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
