import { motifReuse } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type MotifReuseCardProps = {
  motifs: typeof motifReuse;
};

const riskClass: Record<string, string> = {
  低: "bg-emerald-50 text-emerald-700",
  中: "bg-amber-50 text-amber-700",
  高: "bg-rose-50 text-rose-700"
};

export function MotifReuseCard({ motifs }: MotifReuseCardProps) {
  return (
    <SectionCard title="画像モチーフ使い回しチェック" description="似た構図の連続を避けるためのデモ確認です。">
      <div className="space-y-3">
        {motifs.map((motif) => (
          <div key={motif.motif} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{motif.motif}</p>
              <p className="mt-1 text-xs text-slate-500">
                使用 {motif.count}回 / 最終使用 {motif.lastUsed}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskClass[motif.risk]}`}>
              {motif.risk}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
