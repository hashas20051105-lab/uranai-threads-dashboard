import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { PrePublishCheckResult, PrePublishCheckStatus } from "@/types/domain";

export function PrePublishChecklist({ result }: { result: PrePublishCheckResult | null }) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        投稿案と予約内容を入力すると、投稿前チェックを実行できます。
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-950">投稿前チェック</p>
        <StatusBadge status={result.overallStatus} />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {result.items.map((item) => (
          <div key={item.key} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <StatusIcon status={item.status} />
              <p className="text-xs font-bold text-slate-800">{item.label}</p>
              <StatusBadge status={item.status} compact />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: PrePublishCheckStatus }) {
  if (status === "OK") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "予約不可") return <XCircle className="h-4 w-4 text-rose-600" />;
  return <AlertTriangle className="h-4 w-4 text-amber-600" />;
}

function StatusBadge({ status, compact }: { status: PrePublishCheckStatus; compact?: boolean }) {
  const className =
    status === "OK"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "注意"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : status === "要修正"
          ? "bg-orange-50 text-orange-700 ring-orange-200"
          : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${className} ${compact ? "ml-auto" : ""}`}>
      {status}
    </span>
  );
}
