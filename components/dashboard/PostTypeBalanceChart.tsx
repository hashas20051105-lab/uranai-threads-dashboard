"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { postTypeBalance } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type PostTypeBalanceChartProps = {
  data: typeof postTypeBalance;
};

export function PostTypeBalanceChart({ data }: PostTypeBalanceChartProps) {
  return (
    <SectionCard title="投稿タイプ別バランス" description="初期比率に近い運用になっているかを確認します。">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={48} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="target" fill="#ddd6fe" radius={[4, 4, 0, 0]} name="目標" />
            <Bar dataKey="value" fill="#6d28d9" radius={[4, 4, 0, 0]} name="現在" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
