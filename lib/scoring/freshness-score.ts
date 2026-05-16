type FreshnessInput = {
  genre: string;
  hook: string;
  referencedTrend: string;
  calendarEvents: string[];
};

export function calculateFreshnessScore({ genre, hook, referencedTrend, calendarEvents }: FreshnessInput) {
  let score = 55;
  const reasons: string[] = [];

  if (calendarEvents.some((event) => referencedTrend.includes(event) || hook.includes(event) || genre.includes(event))) {
    score += 20;
    reasons.push("直近の占いカレンダーと接続しています。");
  }

  if (/(今日|朝|今週|最近|新月|満月|一粒万倍日)/.test(hook + referencedTrend)) {
    score += 15;
    reasons.push("時間性のある切り口です。");
  }

  if (/(日常|違和感|気づき|予定変更)/.test(hook + referencedTrend)) {
    score += 10;
    reasons.push("日常の観察と結びついています。");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reason: reasons.join(" ") || "鮮度は標準的です。"
  };
}
