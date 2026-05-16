"use client";

import { ImageIcon, Info } from "lucide-react";
import type { GeneratedIdea, PostStatus } from "@/types/domain";
import { IdeaActionButtons } from "@/components/ideas/IdeaActionButtons";
import { IdeaScoreBadges } from "@/components/ideas/IdeaScoreBadges";

type IdeaCardProps = {
  idea: GeneratedIdea;
  index: number;
  onStatusChange: (index: number, status: PostStatus) => void;
  updating?: boolean;
};

export function IdeaCard({ idea, index, onStatusChange, updating }: IdeaCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">#{index + 1}</span>
            <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700">{idea.genre}</span>
            <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">{idea.postType}</span>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
              {idea.status}
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-normal text-slate-950">{idea.hook}</h2>
          <p className="mt-1 text-xs text-slate-500">{idea.patternType} / {idea.referencedTrend}</p>
        </div>
        <IdeaActionButtons
          disabled={updating}
          ideaId={idea.id}
          currentStatus={idea.status}
          onChange={(status) => onStatusChange(index, status)}
        />
      </div>

      <IdeaScoreBadges idea={idea} />

      <div className="mt-4 rounded-md bg-slate-50 p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{idea.fullText}</p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <InfoBlock title="人間味理由" body={idea.humanReason} />
        <InfoBlock title="テンプレ危険度理由" body={idea.templateRiskReason} />
        <InfoBlock title="鮮度理由" body={idea.freshnessReason} />
        <InfoBlock title="競合類似度理由" body={idea.competitorSimilarityReason} />
      </div>

      <div className="mt-4 rounded-md border border-violet-100 bg-violet-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-violet-900">
          <ImageIcon className="h-4 w-4" />
          画像生成プロンプト
        </div>
        <p className="text-xs font-semibold text-violet-700">JP</p>
        <p className="mt-1 text-xs leading-5 text-violet-950">{idea.imagePrompt.promptJapanese}</p>
        <p className="mt-3 text-xs font-semibold text-violet-700">EN</p>
        <p className="mt-1 text-xs leading-5 text-violet-950">{idea.imagePrompt.promptEnglish}</p>
      </div>

      <div className="mt-4 rounded-md border border-slate-100 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-xs leading-5 text-slate-600">
            <span className="font-bold text-slate-800">{idea.publishDecision}: </span>
            {idea.publishDecisionReason}
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-slate-100 p-3">
      <p className="text-xs font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-700">{body}</p>
    </div>
  );
}
