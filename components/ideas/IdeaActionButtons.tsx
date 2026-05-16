"use client";

import Link from "next/link";
import type { PostStatus } from "@/types/domain";

type IdeaActionButtonsProps = {
  disabled?: boolean;
  ideaId?: string;
  currentStatus?: PostStatus;
  onChange: (status: PostStatus) => void;
};

const actions: Array<{ label: string; status: PostStatus; className: string }> = [
  { label: "採用", status: "adopted", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { label: "修正", status: "needs_edit", className: "border-amber-200 bg-amber-50 text-amber-700" },
  { label: "ボツ", status: "rejected", className: "border-rose-200 bg-rose-50 text-rose-700" }
];

export function IdeaActionButtons({ disabled, ideaId, currentStatus, onChange }: IdeaActionButtonsProps) {
  const canReserve = Boolean(ideaId && (currentStatus === "adopted" || currentStatus === "needs_edit"));

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={disabled}
          onClick={() => onChange(action.status)}
          className={`rounded-md border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}
        >
          {action.label}
        </button>
      ))}
      {canReserve ? (
        <Link
          href={`/reservations?idea=${ideaId}`}
          className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
        >
          予約へ
        </Link>
      ) : (
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400">
          予約へ
        </span>
      )}
    </div>
  );
}
