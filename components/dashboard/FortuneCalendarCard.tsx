import { fortuneCalendar } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type FortuneCalendarCardProps = {
  events: typeof fortuneCalendar;
};

export function FortuneCalendarCard({ events }: FortuneCalendarCardProps) {
  return (
    <SectionCard title="占いカレンダー" description="直近イベントと投稿角度のデモです。">
      <div className="space-y-3">
        {events.map((event) => (
          <div key={`${event.date}-${event.event}`} className="flex gap-3 rounded-md border border-slate-100 p-3">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-violet-50 text-violet-700">
              <span className="text-xs font-bold">{event.date}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-950">{event.event}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {event.genre}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{event.angle}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
