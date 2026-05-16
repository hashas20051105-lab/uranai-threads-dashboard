import type { InsightDashboardData, ReportType } from "@/types/domain";

export function buildChatGptReportPrompt(type: ReportType, data: InsightDashboardData, summary: string) {
  const periodLabel = type === "daily" ? "今日" : "今週";
  const topPost = data.insights[0];
  return [
    "あなたは占いThreadsアカウントの編集長です。",
    `${periodLabel}の成果をもとに、次回投稿案を改善してください。`,
    "",
    "成果要約:",
    summary,
    "",
    "伸びた投稿:",
    topPost ? `${topPost.hook ?? "hookなし"} / buzz_score ${topPost.buzzScore} / ${topPost.text ?? ""}` : "データなし",
    "",
    `伸びたジャンル: ${data.byGenre.slice(0, 5).map((item) => `${item.key}(${item.averageBuzzScore})`).join(", ") || "データなし"}`,
    `伸びた型: ${data.byPattern.slice(0, 5).map((item) => `${item.key}(${item.averageBuzzScore})`).join(", ") || "データなし"}`,
    `伸びた投稿タイプ: ${data.byPostType.slice(0, 5).map((item) => `${item.key}(${item.averageBuzzScore})`).join(", ") || "データなし"}`,
    `伸びたCTA: ${data.byCta.slice(0, 5).map((item) => `${item.key}(${item.averageBuzzScore})`).join(", ") || "データなし"}`,
    `伸びた画像モチーフ: ${data.byMotif.slice(0, 5).map((item) => `${item.key}(${item.averageBuzzScore})`).join(", ") || "データなし"}`,
    "",
    "依頼:",
    "- AI量産っぽさを避ける",
    "- 日常素材と人間味を入れる",
    "- 強すぎる断定や恐怖訴求を避ける",
    "- 次に試す投稿案を5本提案する",
    "- 避けるべき投稿パターンも列挙する"
  ].join("\n");
}

