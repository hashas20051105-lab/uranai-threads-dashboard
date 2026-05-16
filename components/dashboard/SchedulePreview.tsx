import { schedulePreview } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type ScheduleItem = {
  time: string;
  title: string;
  genre: string;
  status: string;
};

type SchedulePreviewProps = {
  items: Array<ScheduleItem> | typeof schedulePreview;
};

export function SchedulePreview({ items }: SchedulePreviewProps) {
  return (
    <SectionCard title="投稿スケジュール" description="Phase 5では予約保存まで。実投稿は次Phaseで扱います。">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.time}-${item.title}`} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-md border border-slate-100 p-3">
            <span className="text-sm font-bold text-slate-950">{item.time}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.genre}</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
