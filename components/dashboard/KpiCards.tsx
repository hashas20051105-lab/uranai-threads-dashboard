import type { dashboardKpis } from "@/lib/demo-data";

type KpiCardsProps = {
  items: typeof dashboardKpis;
};

const toneClasses: Record<string, string> = {
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700"
};

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-2xl font-bold tracking-normal text-slate-950">{item.value}</span>
                  {item.unit ? <span className="pb-1 text-xs font-semibold text-slate-500">{item.unit}</span> : null}
                </div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClasses[item.tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-emerald-600">{item.change}</p>
          </article>
        );
      })}
    </section>
  );
}
