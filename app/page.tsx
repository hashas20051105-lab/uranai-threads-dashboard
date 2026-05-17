import Link from "next/link";
import { ArrowRight, Database, ShieldCheck, Sparkles } from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants";

const items = [
  { title: "MVP Protected Mode", description: "簡易ログインで管理画面と投稿APIを保護しています。", icon: ShieldCheck },
  { title: "Supabase Ready", description: "手動インポート、投稿案、予約、インサイト、レポートのDB基盤があります。", icon: Database },
  { title: "Editor Workflow", description: "大量連投ではなく、編集長チェックを通して自然な投稿運用を支えます。", icon: Sparkles }
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-violet-700">MVP Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">{APP_NAME}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{APP_SUBTITLE}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-violet-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-violet-800"
        >
          ダッシュボードを開く
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
          <Link className="hover:text-violet-700" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-violet-700" href="/terms">
            Terms of Use
          </Link>
          <Link className="hover:text-violet-700" href="/app-review">
            App Review Notes
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
