import { ThreadsApiSettingsCard } from "@/components/settings/ThreadsApiSettingsCard";
import { getThreadsApiStatus } from "@/services/threads-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const threadsStatus = await getThreadsApiStatus();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Settings</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">設定</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Threads APIの接続状態を確認します。secret値は画面に表示せず、投稿実行もここでは行いません。
        </p>
      </section>

      <ThreadsApiSettingsCard initialStatus={threadsStatus} />
    </div>
  );
}
