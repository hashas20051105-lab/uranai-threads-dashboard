import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationList } from "@/components/reservations/ReservationList";
import { listReservationCandidateIdeas, listReservations } from "@/services/reservation-service";

export const dynamic = "force-dynamic";

export default async function ReservationsPage({ searchParams }: { searchParams?: Promise<{ idea?: string }> }) {
  const params = await searchParams;
  const [ideas, reservations] = await Promise.all([listReservationCandidateIdeas(), listReservations()]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 5 後半</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">投稿予約</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          採用済み投稿案を予約し、dry-runで最終確認したうえで、承認済み・時刻到達済みの投稿だけThreadsへ実行できます。
        </p>
      </section>

      <ReservationForm ideas={ideas} initialIdeaId={params?.idea} />

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-950">予約一覧</h2>
        <ReservationList reservations={reservations} />
      </div>
    </div>
  );
}
