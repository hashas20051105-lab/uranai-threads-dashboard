"use client";

import { useMemo, useState } from "react";
import { ReservationCard } from "@/components/reservations/ReservationCard";
import type { Reservation } from "@/types/domain";

export function ReservationList({ reservations }: { reservations: Reservation[] }) {
  const [status, setStatus] = useState("all");
  const [postType, setPostType] = useState("all");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("scheduled_asc");

  const genres = useMemo(() => [...new Set(reservations.map((reservation) => reservation.idea?.genre).filter(Boolean))], [reservations]);
  const filtered = useMemo(() => {
    return reservations
      .filter((reservation) => status === "all" || reservation.status === status)
      .filter((reservation) => postType === "all" || reservation.postType === postType)
      .filter((reservation) => genre === "all" || reservation.idea?.genre === genre)
      .sort((a, b) => {
        if (sort === "scheduled_desc") return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        if (sort === "created_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  }, [genre, postType, reservations, sort, status]);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="all">すべてのstatus</option>
            {["draft", "pending_approval", "scheduled", "cancelled", "posted", "error"].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={postType} onChange={(event) => setPostType(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="all">すべての投稿タイプ</option>
            {["TEXT", "IMAGE", "VIDEO", "THREAD"].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={genre} onChange={(event) => setGenre(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="all">すべてのジャンル</option>
            {genres.map((value) => <option key={value} value={value ?? ""}>{value}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="scheduled_asc">予約日時 昇順</option>
            <option value="scheduled_desc">予約日時 降順</option>
            <option value="created_desc">作成日時 降順</option>
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-800">予約はまだありません。</p>
          <p className="mt-2 text-xs text-slate-500">採用済み投稿案から予約を作成すると、ここに表示されます。</p>
        </div>
      )}
    </section>
  );
}
