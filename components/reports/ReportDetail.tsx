import { ChatGptPromptPanel } from "@/components/reports/ChatGptPromptPanel";
import type { SavedReport } from "@/types/domain";

export function ReportDetail({ report }: { report: SavedReport }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{report.reportType}</span>
        <span className="text-sm font-semibold text-slate-500">{report.reportDate}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{report.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <MiniList title="Top genres" rows={report.topGenres} />
        <MiniList title="Top hooks" rows={report.topHooks} />
        <MiniList title="Top post types" rows={report.topPostTypes} />
        <MiniList title="Next recommendations" rows={report.nextRecommendations} />
      </div>
      <div className="mt-4">
        <ChatGptPromptPanel prompt={report.chatgptPrompt} />
      </div>
    </article>
  );
}

function MiniList({ title, rows }: { title: string; rows: unknown[] }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {rows.slice(0, 5).map((row, index) => (
          <li key={index}>{typeof row === "object" && row !== null && "key" in row ? String((row as { key?: unknown }).key) : JSON.stringify(row)}</li>
        ))}
        {rows.length === 0 ? <li>データなし</li> : null}
      </ul>
    </div>
  );
}

