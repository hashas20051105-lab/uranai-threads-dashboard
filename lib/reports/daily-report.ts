import { buildChatGptReportPrompt } from "@/lib/reports/chatgpt-prompt";
import type { InsightDashboardData, SavedReport } from "@/types/domain";

export function buildDailyReportPayload(reportDate: string, data: InsightDashboardData): Omit<SavedReport, "id" | "createdAt"> {
  const summary = buildSummary("daily", data);
  return {
    reportType: "daily",
    reportDate,
    summary,
    topGenres: data.byGenre.slice(0, 5),
    topHooks: data.byHook.slice(0, 10),
    topPatterns: data.byPattern.slice(0, 5),
    topPostTypes: data.byPostType.slice(0, 5),
    topMotifs: data.byMotif.slice(0, 5),
    templateRiskSummary: Object.fromEntries(data.byTemplateRisk.map((item) => [item.key, item])),
    competitorRanking: [],
    nextRecommendations: buildNextRecommendations(data, "明日"),
    chatgptPrompt: buildChatGptReportPrompt("daily", data, summary)
  };
}

export function buildSummary(scope: "daily" | "weekly", data: InsightDashboardData) {
  const totalPosts = data.insights.length;
  const totalViews = data.insights.reduce((sum, insight) => sum + insight.viewCount, 0);
  const totalEngagement = data.insights.reduce((sum, insight) => sum + insight.engagementTotal, 0);
  const averageBuzz = totalPosts > 0 ? Math.round((data.insights.reduce((sum, insight) => sum + insight.buzzScore, 0) / totalPosts) * 10) / 10 : 0;
  const label = scope === "daily" ? "今日" : "今週";
  return `${label}の投稿数は${totalPosts}件、総表示回数は${totalViews}、総エンゲージメントは${totalEngagement}、平均バズスコアは${averageBuzz}です。`;
}

export function buildNextRecommendations(data: InsightDashboardData, periodLabel: string) {
  return [
    {
      title: `${periodLabel}の推奨ジャンル`,
      value: data.byGenre[0]?.key ?? "データ蓄積後に判定",
      reason: "平均バズスコアが高い軸を優先します。"
    },
    {
      title: `${periodLabel}の推奨投稿タイプ`,
      value: data.byPostType[0]?.key ?? "日常つぶやき型を少量混ぜる",
      reason: "投稿タイプの偏りを避けながら成果の高い型を増やします。"
    },
    {
      title: "避けるべき表現",
      value: "過度な断定、同一CTA連発、不安を強く煽る表現",
      reason: "テンプレ危険度と読者体験の悪化を避けるためです。"
    },
    {
      title: "次回の実験案",
      value: data.byHook[0] ? `${data.byHook[0].key} に近い自然なフックを別ジャンルで試す` : "フック別成果を蓄積する",
      reason: "伸びた要素をコピーせず、角度だけを検証します。"
    }
  ];
}

