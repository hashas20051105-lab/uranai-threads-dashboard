"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { InsightAggregate } from "@/types/domain";

const colors = ["#6d28d9", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#64748b"];

export function PostTypeInsightChart({ data }: { data: InsightAggregate[] }) {
  const rows = data.slice(0, 6).map((item) => ({ name: item.key, value: item.count, score: item.averageBuzzScore }));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">投稿タイプ別成果</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
                {rows.map((row, index) => <Cell key={row.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.key} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />{item.key}</span>
              <span className="font-bold text-slate-900">{item.averageBuzzScore}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

