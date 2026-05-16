import Link from "next/link";
import { Plus } from "lucide-react";
import { BuzzPostsTable } from "@/components/buzz/BuzzPostsTable";
import { ThreadsCollectPanel } from "@/components/buzz/ThreadsCollectPanel";
import { listBuzzPosts } from "@/services/buzz-service";
import { getThreadsApiStatus } from "@/services/threads-service";

export const dynamic = "force-dynamic";

export default async function BuzzPage() {
  const [posts, threadsStatus] = await Promise.all([listBuzzPosts(), getThreadsApiStatus()]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 3 / Phase 4</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">バズ調査</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            手動入力・CSV・Threads API読み取りで保存した占い系バズ投稿を分析します。投稿実行はまだ行いません。
          </p>
        </div>
        <Link href="/import" className="inline-flex h-10 items-center gap-2 rounded-md bg-violet-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-violet-800">
          <Plus className="h-4 w-4" />
          手動インポート
        </Link>
      </section>

      <ThreadsCollectPanel initialStatus={threadsStatus} />

      {posts.length > 0 ? (
        <BuzzPostsTable posts={posts} />
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">まだバズ投稿がありません。</p>
          <p className="mt-2 text-xs text-slate-500">手動インポートまたはCSV貼り付けでデータを追加してください。</p>
        </section>
      )}
    </div>
  );
}
