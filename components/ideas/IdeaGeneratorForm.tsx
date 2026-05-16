"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import type { DailyMaterialInput, GeneratedIdea, IdeaGenerationResult, PostStatus } from "@/types/domain";
import { DailyMaterialForm } from "@/components/ideas/DailyMaterialForm";
import { GeneratedPromptPanel } from "@/components/ideas/GeneratedPromptPanel";
import { IdeaCard } from "@/components/ideas/IdeaCard";

const initialDailyMaterial: DailyMaterialInput = {
  happened: "朝の予定が少し変わった",
  weather: "薄い曇り",
  mood: "落ち着いている",
  recentFeeling: "急がず整えたい",
  messageToReader: "自分のペースを取り戻してほしい",
  operatorNote: "今日は短めに伝える",
  atmosphere: "静かで少し湿度のある空気",
  smallRealization: "焦るほど視野が狭くなる",
  personalExperience: "手帳に3行だけ書いたら少し軽くなった"
};

export function IdeaGeneratorForm() {
  const [dailyMaterial, setDailyMaterial] = useState<DailyMaterialInput>(initialDailyMaterial);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [prompt, setPrompt] = useState("");
  const [openaiConfigured, setOpenaiConfigured] = useState<boolean | null>(null);
  const [savedToSupabase, setSavedToSupabase] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"openai" | "demo" | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function generate(forceDemo: boolean) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyMaterial, forceDemo })
      });

      if (!response.ok) throw new Error("failed");
      const result = (await response.json()) as IdeaGenerationResult;
      setIdeas(result.ideas);
      setPrompt(result.promptForChatGPT);
      setOpenaiConfigured(result.openaiConfigured);
      setSavedToSupabase(result.savedToSupabase);
      setMode(result.mode);
    } catch {
      setError("投稿案生成に失敗しました。時間をおいて再度試してください。");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(index: number, status: PostStatus) {
    const target = ideas[index];
    setUpdatingIndex(index);
    setIdeas((current) => current.map((idea, ideaIndex) => (ideaIndex === index ? { ...idea, status } : idea)));

    if (target.id) {
      await fetch("/api/ideas/check", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: target.id, status })
      });
    }

    setUpdatingIndex(null);
  }

  return (
    <div className="space-y-6">
      <DailyMaterialForm value={dailyMaterial} onChange={setDailyMaterial} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">投稿案生成</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              OpenAI APIキーがあればサーバー側で呼び出します。キーがない場合もデモ生成できます。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => generate(false)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wand2 className="h-4 w-4" />
              30本生成
            </button>
            <button
              type="button"
              onClick={() => generate(true)}
              disabled={loading}
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              デモ生成
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            生成件数: {ideas.length || 0} / 30
          </span>
          {mode ? <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">mode: {mode}</span> : null}
          {savedToSupabase !== null ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              Supabase保存: {savedToSupabase ? "成功" : "未接続"}
            </span>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </section>

      <GeneratedPromptPanel prompt={prompt} openaiConfigured={openaiConfigured} />

      {ideas.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {ideas.map((idea, index) => (
            <IdeaCard
              key={`${idea.id ?? idea.hook}-${index}`}
              idea={idea}
              index={index}
              updating={updatingIndex === index}
              onStatusChange={changeStatus}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">まだ投稿案はありません。</p>
          <p className="mt-2 text-xs text-slate-500">日常素材を確認して「30本生成」または「デモ生成」を押してください。</p>
        </section>
      )}
    </div>
  );
}
