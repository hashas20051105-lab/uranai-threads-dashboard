import { Bell, CircleHelp, Clock3, Settings2, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { APP_SUBTITLE, APP_TIMEZONE } from "@/lib/constants";
import { getDashboardHeaderSummary } from "@/services/dashboard-service";

const topTabs = ["概要", "バズ投稿", "投稿案", "予約", "投稿スケジュール", "インサイト", "レポート"];

const statusTone = {
  良好: "border-emerald-200 bg-emerald-50 text-emerald-800",
  注意: "border-amber-200 bg-amber-50 text-amber-800",
  要確認: "border-orange-200 bg-orange-50 text-orange-800",
  停止推奨: "border-rose-200 bg-rose-50 text-rose-800"
};

export async function Header() {
  const header = await getDashboardHeaderSummary();
  const date = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIMEZONE
  }).format(new Date());

  return (
    <header className="mb-6 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{APP_SUBTITLE}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topTabs.map((tab, index) => (
              <span
                key={tab}
                className={
                  index === 0
                    ? "rounded-md bg-violet-700 px-4 py-2 text-xs font-bold text-white"
                    : "rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                }
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            MVP Protected Mode
          </span>
          <span className="inline-flex h-9 items-center rounded-md border bg-white px-3 text-xs font-semibold text-slate-700">
            アカウント：{header.accountName}
          </span>
          <span className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-bold ${statusTone[header.operationStatus]}`}>
            今日の運用ステータス：{header.operationStatus}
          </span>
          <span className="inline-flex items-center gap-2 text-xs">
            <Clock3 className="h-4 w-4 text-violet-700" />
            {date}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-slate-600">
            <Bell className="h-4 w-4" />
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-slate-600">
            <CircleHelp className="h-4 w-4" />
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-slate-600">
            <Settings2 className="h-4 w-4" />
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
