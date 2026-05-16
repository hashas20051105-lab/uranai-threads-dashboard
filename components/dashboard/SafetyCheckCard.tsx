import { CheckCircle2, Info } from "lucide-react";
import { safetyChecks } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type SafetyCheckCardProps = {
  items: typeof safetyChecks;
};

export function SafetyCheckCard({ items }: SafetyCheckCardProps) {
  return (
    <SectionCard title="安全チェック" description="API未接続のため、Phase 1ではデモ状態のみ表示します。" action="Demo">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const pending = item.state.includes("Phase");

          return (
            <div key={item.label} className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
              {pending ? (
                <Info className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="truncate text-sm font-bold text-slate-950">{item.value}</p>
                <p className="truncate text-xs text-slate-500">{item.state}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
