import { ExternalLink } from "lucide-react";
import { buzzPosts } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type BuzzPostsTableProps = {
  posts: typeof buzzPosts;
};

export function BuzzPostsTable({ posts }: BuzzPostsTableProps) {
  return (
    <SectionCard title="昨日のバズ投稿TOP20" description="Phase 1用の自然な占い全般デモデータです。" action="Demo">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs font-semibold text-slate-500">
              <th className="w-12 py-3">順位</th>
              <th className="min-w-[280px] py-3">フック</th>
              <th className="py-3">投稿者</th>
              <th className="py-3">ジャンル</th>
              <th className="py-3">型</th>
              <th className="py-3 text-right">スコア</th>
              <th className="py-3 text-right">いいね</th>
              <th className="py-3 text-right">返信</th>
              <th className="py-3 text-right">信頼度</th>
              <th className="py-3 text-right">URL</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.rank} className="border-b border-slate-100 last:border-0">
                <td className="py-3 font-bold text-slate-700">{post.rank}</td>
                <td className="py-3">
                  <p className="line-clamp-2 font-medium text-slate-900">{post.hook}</p>
                </td>
                <td className="py-3 text-xs font-medium text-slate-500">{post.author}</td>
                <td className="py-3">
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {post.genre}
                  </span>
                </td>
                <td className="py-3 text-xs text-slate-600">{post.pattern}</td>
                <td className="py-3 text-right font-bold text-slate-950">{post.buzzScore.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-600">{post.likes.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-600">{post.replies.toLocaleString()}</td>
                <td className="py-3 text-right text-slate-600">{Math.round(post.confidence * 100)}%</td>
                <td className="py-3 text-right">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-400">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
