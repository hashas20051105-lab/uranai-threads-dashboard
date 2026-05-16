import { quickStats } from "@/lib/demo-data";

type QuickStatsProps = {
  stats: typeof quickStats;
};

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{stat.value}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
