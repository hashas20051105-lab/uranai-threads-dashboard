import { templateRiskItems } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type TemplateRiskCardProps = {
  items: typeof templateRiskItems;
};

export function TemplateRiskCard({ items }: TemplateRiskCardProps) {
  return (
    <SectionCard title="テンプレ乱発チェック" description="同じ型、CTA、断定表現の偏りをデモ評価します。">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">
                {item.score}
                <span className="ml-1 text-xs text-slate-500">{item.level}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-violet-600"
                style={{ width: `${Math.min(item.score, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
