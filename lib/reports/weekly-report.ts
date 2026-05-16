import { buildSummary, buildNextRecommendations } from "@/lib/reports/daily-report";
import { buildChatGptReportPrompt } from "@/lib/reports/chatgpt-prompt";
import type { InsightDashboardData, SavedReport } from "@/types/domain";

export function buildWeeklyReportPayload(reportDate: string, data: InsightDashboardData): Omit<SavedReport, "id" | "createdAt"> {
  const summary = `${buildSummary("weekly", data)} 曜日別・時間帯別の傾向はインサイトが増えるほど精度が上がります。`;
  return {
    reportType: "weekly",
    reportDate,
    summary,
    topGenres: data.byGenre.slice(0, 7),
    topHooks: data.byHook.slice(0, 10),
    topPatterns: data.byPattern.slice(0, 7),
    topPostTypes: data.byPostType.slice(0, 7),
    topMotifs: data.byMotif.slice(0, 7),
    templateRiskSummary: Object.fromEntries(data.byTemplateRisk.map((item) => [item.key, item])),
    competitorRanking: [],
    nextRecommendations: buildNextRecommendations(data, "来週"),
    chatgptPrompt: buildChatGptReportPrompt("weekly", data, summary)
  };
}

