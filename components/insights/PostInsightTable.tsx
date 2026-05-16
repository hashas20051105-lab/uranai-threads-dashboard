import type { PostInsight } from "@/types/domain";

export function PostInsightTable({ insights }: { insights: PostInsight[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">投稿別成果</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["投稿", "genre", "type", "views", "engagement", "buzz", "hours", "source"].map((head) => (
                <th key={head} className="whitespace-nowrap px-3 py-2 font-bold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {insights.map((insight) => (
              <tr key={insight.id}>
                <td className="max-w-sm px-3 py-3">
                  <p className="line-clamp-2 font-semibold text-slate-900">{insight.hook ?? insight.text ?? "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">{insight.cta ?? "-"}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-3">{insight.genre ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-3">{insight.postType ?? "-"}</td>
                <td className="px-3 py-3">{insight.viewCount}</td>
                <td className="px-3 py-3">{insight.engagementTotal}</td>
                <td className="px-3 py-3 font-bold text-violet-700">{insight.buzzScore}</td>
                <td className="px-3 py-3">{insight.hoursAfterPost ?? "-"}h</td>
                <td className="px-3 py-3">{insight.dataSource}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {insights.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">インサイトはまだありません。</p> : null}
      </div>
    </section>
  );
}

