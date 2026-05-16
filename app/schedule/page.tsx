import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { listScheduleReservations } from "@/services/reservation-service";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const reservations = await listScheduleReservations();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Schedule</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">投稿スケジュール</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">今日から7日間の予約を表示します。実投稿は次Phaseで実装します。</p>
        </div>
        <Link href="/reservations" className="inline-flex h-10 items-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-violet-800">
          <CalendarDays className="h-4 w-4" />
          予約を管理
        </Link>
      </section>

      {reservations.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{reservation.postType}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{reservation.status}</span>
              </div>
              <p className="text-sm font-bold text-slate-950">{formatDateTime(reservation.scheduledAt)}</p>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{reservation.text}</p>
              <p className="mt-3 text-xs text-slate-500">{reservation.idea?.genre ?? "ジャンル未設定"} / {reservation.idea?.postType ?? "投稿タイプ未設定"}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-800">今週の予約はまだありません。</p>
          <p className="mt-2 text-xs text-slate-500">投稿予約ページで scheduled または pending_approval の予約を作ると表示されます。</p>
        </section>
      )}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}
