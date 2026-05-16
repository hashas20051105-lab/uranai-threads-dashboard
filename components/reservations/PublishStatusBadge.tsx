import type { Reservation } from "@/types/domain";

export function PublishStatusBadge({ reservation }: { reservation: Reservation }) {
  const label = reservation.threadsPostId
    ? "published"
    : reservation.status === "error"
      ? "publish error"
      : reservation.status === "scheduled"
        ? "ready when due"
        : reservation.status;

  const tone = reservation.threadsPostId
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : reservation.status === "error"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : reservation.status === "scheduled"
        ? "bg-violet-50 text-violet-700 ring-violet-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tone}`}>{label}</span>;
}

