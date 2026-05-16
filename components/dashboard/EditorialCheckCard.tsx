import { CheckCircle2, CircleAlert } from "lucide-react";
import { editorialChecks } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type EditorialCheckCardProps = {
  items: typeof editorialChecks;
};

export function EditorialCheckCard({ items }: EditorialCheckCardProps) {
  return (
    <SectionCard title="編集長チェック" description="自然運用らしさと投稿バランスのデモ判定です。">
      <div className="space-y-3">
        {items.map((item) => {
          const ok = item.status === "OK";

          return (
            <div key={item.label} className="flex gap-3 rounded-md bg-slate-50 p-3">
              {ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
