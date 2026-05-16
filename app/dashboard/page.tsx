import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  ShieldCheck,
  Star,
  TrendingUp,
  Wand2
} from "lucide-react";
import { AdoptIdeaButton } from "@/components/dashboard/adopt-idea-button";
import { getDashboardSummary } from "@/services/dashboard-service";
import type { DashboardSummary, DashboardTone } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const kpis = summary.kpis;

  return (
    <div className="space-y-5">
      {summary.isFallback ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Supabaseに集計対象データがまだ少ないため、一部は「未計測」「未設定」と表示しています。
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard icon={TrendingUp} label="総収集投稿数" value={formatNumber(kpis.totalCollectedPosts)} unit="件" />
        <KpiCard icon={Gauge} label="平均バズスコア" value={formatNullable(kpis.averageBuzzScore, 1)} />
        <KpiCard
          icon={Clock}
          label="本日の投稿枠"
          value={`${kpis.todayPostSlots.used} / ${kpis.todayPostSlots.limit}`}
          unit={`残り ${Math.max(0, kpis.todayPostSlots.limit - kpis.todayPostSlots.used)} 件`}
          progress={Math.min(100, Math.round((kpis.todayPostSlots.used / Math.max(1, kpis.todayPostSlots.limit)) * 100))}
        />
        <KpiCard icon={CheckCircle2} label="投稿成功率" value={kpis.postSuccessRate === null ? "未計測" : `${kpis.postSuccessRate}%`} tone="emerald" />
        <KpiCard icon={Wand2} label="人間味スコア平均" value={formatNullable(kpis.averageHumanScore, 1)} unit={kpis.averageHumanScore === null ? undefined : "/ 100"} />
        <KpiCard icon={ShieldCheck} label="テンプレ危険度" value={riskLabel(kpis.templateRisk)} tone={kpis.templateRisk === "low" ? "emerald" : "violet"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.35fr_0.85fr_0.85fr]">
        <Panel title="編集長チェック" icon={FileText}>
          <div className="flex gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[8px] border-violet-200 text-center">
              <div>
                <p className="text-2xl font-bold text-violet-700">{summary.editorialCheck.score}</p>
                <p className="text-[10px] text-slate-500">/100</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-bold">今日の編集長スコア</p>
              <CheckRow label="独自性" tone={summary.editorialCheck.originality} detail={summary.editorialCheck.details.originality} />
              <CheckRow label="フック多様性" tone={summary.editorialCheck.hookDiversity} detail={summary.editorialCheck.details.hookDiversity} />
              <CheckRow label="CTA自然さ" tone={summary.editorialCheck.ctaNaturalness} detail={summary.editorialCheck.details.ctaNaturalness} />
              <CheckRow label="投稿間隔" tone={summary.editorialCheck.postInterval} detail={summary.editorialCheck.details.postInterval} />
              <CheckRow label="ユーザー目線" tone={summary.editorialCheck.userPerspective} detail={summary.editorialCheck.details.userPerspective} />
            </div>
          </div>
          <Link href="/ideas" className="mt-4 block w-full rounded-md border border-violet-300 py-2 text-center text-xs font-bold text-violet-700">
            投稿案を確認
          </Link>
        </Panel>

        <Panel title="テンプレ乱発チェック" icon={ShieldCheck}>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricTile label="占い結果比率" value={`${summary.templateRiskSummary.fortunePostRatio}%`} tone={ratioTone(summary.templateRiskSummary.fortunePostRatio, 70, 50)} />
            <MetricTile label="同一CTA使用率" value={`${summary.templateRiskSummary.sameCtaRate}%`} tone={ratioTone(summary.templateRiskSummary.sameCtaRate, 55, 30)} />
            <MetricTile label="類似投稿数" value={`${summary.templateRiskSummary.similarPostCount}件`} tone={summary.templateRiskSummary.similarPostCount > 0 ? "warning" : "good"} />
            <MetricTile label="投稿タイプ偏り" value={`${summary.templateRiskSummary.maxPostTypeRate}%`} tone={summary.templateRiskSummary.postTypeSkew === "high" ? "bad" : summary.templateRiskSummary.postTypeSkew === "medium" ? "warning" : "good"} />
          </div>
          <Link href="/ideas" className="mt-4 block w-full rounded-md border border-violet-300 py-2 text-center text-xs font-bold text-violet-700">
            詳細レポートを見る
          </Link>
        </Panel>

        <Panel title="ブランド人格" icon={Star}>
          {summary.brandPersona.isConfigured ? (
            <InfoRows
              rows={[
                ["ブランドトーン", summary.brandPersona.tone],
                ["言葉づかい", summary.brandPersona.commonPhrases.slice(0, 3).join(" / ") || "未設定"],
                ["世界観", summary.brandPersona.worldview],
                ["得意ジャンル", summary.brandPersona.targetReader],
                ["避けたい表現", summary.brandPersona.bannedPhrases.slice(0, 3).join(" / ") || "未設定"],
                ["CTAスタイル", summary.brandPersona.ctaStyle]
              ]}
            />
          ) : (
            <EmptyState message="ブランド人格が未設定です。" href="/brand" linkLabel="ブランド設定へ" />
          )}
        </Panel>

        <Panel title="安全チェック" icon={ShieldCheck}>
          <InfoRows
            ok
            rows={[
              ["API状態", summary.safety.apiStatus],
              ["トークン期限", summary.safety.tokenStatus],
              ["投稿間隔", summary.safety.postInterval],
              ["重複投稿", summary.safety.duplicatePosts],
              ["NGワード", summary.safety.ngWords],
              ["CTA重複", summary.safety.ctaDuplicate]
            ]}
          />
          <Link href="/settings" className="mt-4 block rounded-md border border-violet-300 py-2 text-center text-xs font-bold text-violet-700">
            詳細を確認
          </Link>
        </Panel>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.15fr_1.65fr]">
        <Panel title="昨日のバズ投稿 TOP20">
          {summary.topPosts.length ? <BuzzPostsTable summary={summary} /> : <EmptyState message="バズ投稿データがまだありません。" href="/import" linkLabel="手動インポートへ" />}
        </Panel>

        <Panel title="本日のおすすめ投稿案">
          {summary.recommendedIdeas.length ? <RecommendedIdeasTable summary={summary} /> : <EmptyState message="投稿案がまだありません。" href="/ideas" linkLabel="投稿案生成へ" />}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-[1.05fr_0.85fr_0.85fr_1.3fr_0.95fr]">
        <Panel title="今日の狙い目ジャンル">
          {summary.recommendedGenres.length ? (
            <RankingList items={summary.recommendedGenres.map((genre) => ({ label: genre.name, value: String(genre.score), sub: genre.reason }))} />
          ) : (
            <EmptyState message="ジャンル集計に使うバズ投稿がありません。" href="/buzz" linkLabel="バズ調査へ" />
          )}
        </Panel>
        <Panel title="投稿タイプ別バランス">
          {summary.postTypeBalance.length ? <DonutLegend items={summary.postTypeBalance} center={`${summary.postTypeBalance.reduce((sum, item) => sum + item.count, 0)}件`} /> : <EmptyState message="投稿タイプ集計は未計測です。" />}
        </Panel>
        <Panel title="伸びたフック TOP10">
          {summary.hookRanking.length ? (
            <RankingList items={summary.hookRanking.map((hook) => ({ label: hook.hook, value: hook.averageScore.toLocaleString() }))} compact />
          ) : (
            <EmptyState message="フック集計に使う投稿がありません。" href="/buzz" linkLabel="バズ調査へ" />
          )}
        </Panel>
        <Panel title="占いカレンダー">
          {summary.fortuneCalendar.length ? <CalendarList items={summary.fortuneCalendar} /> : <EmptyState message="占いカレンダーが未登録です。" href="/calendar" linkLabel="登録ページへ" />}
        </Panel>
        <Panel title="画像モチーフ使い回しチェック">
          {summary.motifReuse.length ? (
            <>
              <DonutLegend items={summary.motifReuse} center={`${summary.motifReuse.reduce((sum, item) => sum + item.count, 0)}件`} />
              <Link href="/buzz" className="mt-4 block rounded-md border border-violet-300 py-2 text-center text-xs font-bold text-violet-700">
                詳細を見る
              </Link>
            </>
          ) : (
            <EmptyState message="画像モチーフの使用データがありません。" />
          )}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="投稿スケジュール">
          {summary.schedule.length ? (
            <div className="space-y-2">
              {summary.schedule.map((item) => (
                <div key={`${item.time}-${item.title}`} className="grid grid-cols-[70px_90px_1fr_80px] items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                  <span className="font-bold text-slate-700">{item.time}</span>
                  <span className="font-bold text-violet-700">{item.genre}</span>
                  <span className="truncate font-semibold">{item.title}</span>
                  <span className="text-right font-bold text-slate-500">{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="予約投稿はまだありません。" href="/reservations" linkLabel="予約ページへ" />
          )}
        </Panel>
        <Panel title="クイック統計">
          <InfoRows
            rows={[
              ["総フォロワー数", summary.quickStats.totalFollowers === null ? "未取得" : formatNumber(summary.quickStats.totalFollowers)],
              ["総インプレッション", formatNumber(summary.quickStats.totalImpressions)],
              ["リポスト数", formatNumber(summary.quickStats.reposts)],
              ["いいね数", formatNumber(summary.quickStats.likes)],
              ["返信数", formatNumber(summary.quickStats.replies)]
            ]}
          />
        </Panel>
      </section>
    </div>
  );
}

function BuzzPostsTable({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] text-left text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>{["順位", "投稿内容", "ジャンル", "型分類", "投稿タイプ", "バズスコア", "反応数", "信頼度"].map((head) => <th key={head} className="px-3 py-2 font-bold">{head}</th>)}</tr>
        </thead>
        <tbody>
          {summary.topPosts.slice(0, 10).map((post) => (
            <tr key={`${post.rank}-${post.hook}`} className="border-b border-slate-100">
              <td className="px-3 py-2 font-bold">{post.rank}</td>
              <td className="max-w-[260px] px-3 py-2 font-semibold text-slate-800">{post.hook}</td>
              <td className="px-3 py-2">{post.genre}</td>
              <td className="px-3 py-2">{post.pattern}</td>
              <td className="px-3 py-2">{post.postType}</td>
              <td className="px-3 py-2 text-right font-bold">{formatNumber(post.buzzScore)}</td>
              <td className="px-3 py-2 text-right">{formatNumber(post.likes + post.replies)}</td>
              <td className="px-3 py-2 text-center"><span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{Math.round(post.confidence * 100)}%</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecommendedIdeasTable({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[840px] text-left text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>{["ジャンル / 投稿タイトル", "AI", "人間味", "危険度", "投稿判断", "競合類似", "鮮度", "CTA", "ブランド", "操作"].map((head) => <th key={head} className="px-3 py-2 font-bold">{head}</th>)}</tr>
        </thead>
        <tbody>
          {summary.recommendedIdeas.map((idea) => (
            <tr key={idea.id} className="border-b border-slate-100">
              <td className="px-3 py-3"><p className="font-bold text-violet-700">{idea.genre}</p><p className="mt-1 text-slate-600">{idea.title}</p></td>
              <td className="px-3 py-3 font-bold">{idea.aiScore}</td>
              <td className="px-3 py-3 font-bold">{idea.humanScore}</td>
              <td className="px-3 py-3"><Badge tone={idea.templateRisk === "low" ? "green" : "amber"}>{idea.templateRiskLabel}</Badge></td>
              <td className="px-3 py-3"><Badge tone={idea.publishDecision === "投稿推奨" ? "green" : "amber"}>{idea.publishDecision}</Badge></td>
              <td className="px-3 py-3">{idea.competitorSimilarityScore}%</td>
              <td className="px-3 py-3 font-bold">{idea.freshnessScore}</td>
              <td className="px-3 py-3"><Badge tone={idea.ctaRisk === "低" || idea.ctaRisk === "low" ? "green" : "amber"}>{idea.ctaRisk}</Badge></td>
              <td className="px-3 py-3 font-bold">{idea.brandMatchRate}%</td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <Link href="/ideas" className="rounded border border-violet-300 px-3 py-1 font-bold text-violet-700">確認</Link>
                  <AdoptIdeaButton ideaId={idea.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, unit, progress, tone = "violet" }: { icon: ElementType; label: string; value: string; unit?: string; progress?: number; tone?: "violet" | "emerald" }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className={`mt-3 text-2xl font-bold ${tone === "emerald" ? "text-emerald-700" : "text-slate-950"}`}>
            {value}
            {unit ? <span className="ml-1 text-xs text-slate-500">{unit}</span> : null}
          </p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-700"}`}><Icon className="h-5 w-5" /></span>
      </div>
      {progress !== undefined ? <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-violet-600" style={{ width: `${progress}%` }} /></div> : null}
    </article>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon?: ElementType; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">{Icon ? <Icon className="h-4 w-4 text-violet-700" /> : null}{title}</h2>
        <span className="text-[11px] font-bold text-violet-600">DB集計</span>
      </div>
      {children}
    </section>
  );
}

function CheckRow({ label, tone, detail }: { label: string; tone: DashboardTone; detail?: string }) {
  return (
    <p className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
      <span className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${toneClass(tone)}`} />{label}</span>
      <span>{toneLabel(tone)}{detail ? ` / ${detail}` : ""}</span>
    </p>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: DashboardTone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className={`mt-2 text-xs font-bold ${toneClass(tone)}`}>{toneLabel(tone)}</p>
    </div>
  );
}

function InfoRows({ rows, ok = false }: { rows: string[][]; ok?: boolean }) {
  return (
    <div className="space-y-2 text-xs">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-bold text-violet-700">{ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}{label}</span>
          <span className="text-right font-bold text-slate-800">{value}</span>
        </div>
      ))}
    </div>
  );
}

function RankingList({ items, compact = false }: { items: Array<{ label: string; value: string; sub?: string }>; compact?: boolean }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={`grid grid-cols-[24px_1fr_auto] gap-2 ${compact ? "text-xs" : "text-sm"}`}>
          <span className="font-bold text-slate-500">{index + 1}</span>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-800">{item.label}</p>
            {item.sub ? <p className="truncate text-[11px] font-medium text-slate-500">{item.sub}</p> : null}
          </div>
          <span className="font-bold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({ items, center }: { items: Array<{ label: string; value: number; color: string }>; center: string }) {
  const stops = buildConicGradient(items);
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <div className="relative h-28 w-28 rounded-full" style={{ background: stops }}>
        <div className="absolute inset-7 flex items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">{center}</div>
      </div>
      <div className="space-y-2 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-semibold text-slate-700"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</span>
            <span className="font-bold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarList({ items }: { items: DashboardSummary["fortuneCalendar"] }) {
  return (
    <div className="space-y-2">
      {items.slice(0, 7).map((item) => (
        <div key={`${item.date}-${item.eventName}`} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-700">{item.date}</span>
            <span className="rounded bg-violet-50 px-2 py-1 font-bold text-violet-700">{item.importanceScore}</span>
          </div>
          <p className="mt-1 font-bold text-slate-950">{item.eventName}</p>
          <p className="mt-1 text-slate-600">{item.relatedGenre} / {item.suggestedAngle}</p>
        </div>
      ))}
    </div>
  );
}

function Badge({ tone, children }: { tone: "green" | "amber"; children: ReactNode }) {
  return <span className={`rounded px-2 py-1 text-[11px] font-bold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{children}</span>;
}

function EmptyState({ message, href, linkLabel }: { message: string; href?: string; linkLabel?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      <p className="font-semibold">{message}</p>
      {href && linkLabel ? <Link href={href} className="mt-3 inline-block rounded-md border border-violet-300 px-3 py-2 text-xs font-bold text-violet-700">{linkLabel}</Link> : null}
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatNullable(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return "未計測";
  return value.toFixed(digits);
}

function riskLabel(value: string) {
  if (value === "blocked") return "停止";
  if (value === "high") return "高";
  if (value === "medium") return "中";
  return "低";
}

function toneLabel(tone: DashboardTone) {
  if (tone === "good") return "良好";
  if (tone === "warning") return "注意";
  return "要確認";
}

function toneClass(tone: DashboardTone) {
  if (tone === "good") return "text-emerald-600";
  if (tone === "warning") return "text-amber-600";
  return "text-rose-600";
}

function ratioTone(value: number, bad: number, warning: number): DashboardTone {
  if (value >= bad) return "bad";
  if (value >= warning) return "warning";
  return "good";
}

function buildConicGradient(items: Array<{ value: number; color: string }>) {
  const palette: Record<string, string> = {
    "bg-violet-600": "#6d28d9",
    "bg-emerald-500": "#10b981",
    "bg-amber-400": "#f59e0b",
    "bg-rose-500": "#ef4444",
    "bg-slate-500": "#64748b"
  };
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += item.value;
    return `${palette[item.color] ?? "#64748b"} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ") || "#e2e8f0 0% 100%"})`;
}
