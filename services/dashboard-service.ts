import { DEFAULT_DAILY_POST_LIMIT, DEFAULT_MIN_POST_INTERVAL_MINUTES, DEFAULT_USER_ID, APP_TIMEZONE } from "@/lib/constants";
import { blockedExpressions, cautionExpressions } from "@/lib/safety/ng-words";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type {
  DashboardHeaderSummary,
  DashboardRecommendedIdea,
  DashboardSummary,
  DashboardTone
} from "@/types/domain";

type Row = Record<string, unknown>;

const VIOLET = "bg-violet-600";
const EMERALD = "bg-emerald-500";
const AMBER = "bg-amber-400";
const ROSE = "bg-rose-500";
const SLATE = "bg-slate-500";

const POST_TYPE_TARGETS: Record<string, number> = {
  "占い・運勢系": 50,
  "日常・共感系": 20,
  "占術解説系": 15,
  "体験談・裏側系": 10,
  "告知・誘導系": 5
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function getDate(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  return null;
}

function formatDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function isToday(date: Date | null) {
  if (!date) return false;
  return formatDateKey(date) === formatDateKey(new Date());
}

function isWithinDays(date: Date | null, days: number) {
  if (!date) return false;
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function groupCount(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function duplicateRate(values: string[]) {
  const filtered = values.filter(Boolean);
  if (!filtered.length) return 0;
  return Math.round((1 - new Set(filtered).size / filtered.length) * 100);
}

function toneFromScore(score: number): DashboardTone {
  if (score >= 75) return "good";
  if (score >= 50) return "warning";
  return "bad";
}

function normalizeRisk(row: Row) {
  const text = toText(row.template_risk);
  if (["low", "medium", "high", "blocked"].includes(text)) return text as "low" | "medium" | "high" | "blocked";
  const score = toNumber(row.template_risk_score, NaN);
  if (!Number.isFinite(score)) return "low";
  if (score >= 90) return "blocked";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function riskLabel(risk: string) {
  if (risk === "blocked") return "停止";
  if (risk === "high") return "高";
  if (risk === "medium") return "中";
  return "低";
}

function ctaRiskLabel(row: Row) {
  const risk = toText(row.cta_risk);
  if (risk) return risk;
  const score = toNumber(row.cta_risk_score, 0);
  if (score >= 70) return "高";
  if (score >= 40) return "中";
  return "低";
}

function postTypeGroup(type: string) {
  if (["占い結果型", "今日の運勢型", "前兆サイン型"].includes(type)) return "占い・運勢系";
  if (["恋愛共感型", "金運共感型", "日常つぶやき型", "質問・交流型"].includes(type)) return "日常・共感系";
  if (type === "占術解説型") return "占術解説系";
  if (["裏側・制作過程型", "失敗談・気づき型"].includes(type)) return "体験談・裏側系";
  if (type === "告知・誘導型") return "告知・誘導系";
  return type || "未分類";
}

async function fetchRows(table: string, limit = 1000): Promise<Row[]> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select("*").eq("user_id", DEFAULT_USER_ID).limit(limit);
  if (error || !data) return [];
  return data as Row[];
}

async function updateIdeaStatus(ideaId: string, status: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, message: "Supabase server client is not configured." };

  const { error } = await supabase
    .from("post_ideas")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ideaId)
    .eq("user_id", DEFAULT_USER_ID);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

function calculatePostIntervals(reservations: Row[]) {
  const times = reservations
    .map((row) => getDate(row, ["scheduled_at"]))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (times.length < 2) return { minMinutes: null, tone: "good" as DashboardTone, label: "予約間隔は問題なし" };

  const gaps = times.slice(1).map((date, index) => Math.round((date.getTime() - times[index].getTime()) / 60000));
  const minMinutes = Math.min(...gaps);
  const tone = minMinutes < DEFAULT_MIN_POST_INTERVAL_MINUTES ? "warning" : "good";
  return {
    minMinutes,
    tone,
    label: minMinutes < DEFAULT_MIN_POST_INTERVAL_MINUTES ? `最短${minMinutes}分で要注意` : `最短${minMinutes}分でOK`
  };
}

function buildHeader(accounts: Row[], errorLogs: Row[], usedSlots: number, limit: number, templateRisk: string): DashboardHeaderSummary {
  const account = accounts[0];
  const accountName = toText(account?.account_name) || toText(account?.handle) || "未設定アカウント";
  const recentCriticalErrors = errorLogs.filter((row) => {
    const source = toText(row.source);
    const severity = toText(row.severity, "error");
    return isWithinDays(getDate(row, ["created_at"]), 2) && (severity === "critical" || source.includes("threads_publish"));
  }).length;

  let operationStatus: DashboardHeaderSummary["operationStatus"] = "良好";
  if (recentCriticalErrors > 0 || templateRisk === "blocked") operationStatus = "停止推奨";
  else if (usedSlots > limit || templateRisk === "high") operationStatus = "要確認";
  else if (usedSlots === limit || templateRisk === "medium") operationStatus = "注意";

  return { accountName, operationStatus };
}

function buildRecommendedIdeas(rows: Row[]): DashboardRecommendedIdea[] {
  const candidates = rows
    .filter((row) => ["draft", "needs_edit", "adopted"].includes(toText(row.status, "draft")))
    .filter((row) => normalizeRisk(row) !== "blocked")
    .filter((row) => toText(row.publish_decision) !== "投稿しない" && toText(row.decision) !== "投稿しない")
    .sort((a, b) => {
      const scoreA = toNumber(a.ai_score) + toNumber(a.human_score) + toNumber(a.freshness_score);
      const scoreB = toNumber(b.ai_score) + toNumber(b.human_score) + toNumber(b.freshness_score);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return candidates.map((row) => {
    const hook = toText(row.hook) || toText(row.hook_text) || toText(row.title) || toText(row.body).slice(0, 34);
    const risk = normalizeRisk(row);
    const brandScore = toNumber(row.brand_match_score, toNumber(row.human_score, 0));
    return {
      id: String(row.id),
      genre: toText(row.genre, "未分類"),
      title: hook || "投稿案タイトル未設定",
      aiScore: Math.round(toNumber(row.ai_score)),
      humanScore: Math.round(toNumber(row.human_score)),
      templateRisk: risk,
      templateRiskLabel: riskLabel(risk),
      publishDecision: toText(row.publish_decision) || toText(row.decision, "未判定"),
      competitorSimilarityScore: Math.round(toNumber(row.competitor_similarity_score)),
      freshnessScore: Math.round(toNumber(row.freshness_score)),
      ctaRisk: ctaRiskLabel(row),
      brandMatchRate: Math.round(brandScore),
      status: toText(row.status, "draft")
    };
  });
}

function buildPostTypeBalance(reservations: Row[], ideas: Row[], insights: Row[]) {
  const todayReservations = reservations.filter((row) => isToday(getDate(row, ["scheduled_at", "created_at"])));
  const todayIdeas = ideas.filter((row) => isToday(getDate(row, ["created_at"])));
  const recentInsights = insights.filter((row) => isWithinDays(getDate(row, ["collected_at", "captured_at", "created_at"]), 7));

  const source = todayReservations.length ? todayReservations : todayIdeas.length ? todayIdeas : recentInsights;
  const values = source.map((row) => postTypeGroup(toText(row.post_type) || toText(row.post_format))).filter(Boolean);
  const total = Math.max(1, values.length);
  const colors = [VIOLET, EMERALD, AMBER, ROSE, SLATE];

  return groupCount(values).slice(0, 5).map(([label, count], index) => ({
    label,
    count,
    value: percent(count, total),
    target: POST_TYPE_TARGETS[label] ?? 0,
    color: colors[index] ?? SLATE
  }));
}

function buildMotifReuse(...rowGroups: Row[][]) {
  const motifs = rowGroups.flatMap((rows) =>
    rows.flatMap((row) => {
      const named = toText(row.motif_name) || toText(row.motif);
      return named ? [named] : toArray(row.visual_motifs);
    })
  );
  const total = Math.max(1, motifs.length);
  const colors = [VIOLET, EMERALD, AMBER, ROSE, SLATE];

  return groupCount(motifs).slice(0, 6).map(([label, count], index) => {
    const rate = percent(count, total);
    return {
      label,
      count,
      value: rate,
      warningLevel: rate >= 50 ? "警告" : rate >= 30 ? "注意" : "OK",
      color: colors[index] ?? SLATE
    };
  });
}

export async function getDashboardHeaderSummary() {
  const [accounts, errorLogs, reservations, ideas] = await Promise.all([
    fetchRows("accounts", 20),
    fetchRows("error_logs", 100),
    fetchRows("post_reservations", 500),
    fetchRows("post_ideas", 500)
  ]);

  const usedSlots = reservations.filter((row) => isToday(getDate(row, ["scheduled_at"])) && ["scheduled", "posted"].includes(toText(row.status))).length;
  const risks = ideas.map(normalizeRisk);
  const templateRisk = risks.includes("blocked") ? "blocked" : risks.includes("high") ? "high" : risks.includes("medium") ? "medium" : "low";
  return buildHeader(accounts, errorLogs, usedSlots, DEFAULT_DAILY_POST_LIMIT, templateRisk);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    accounts,
    settings,
    buzzPosts,
    ideas,
    reservations,
    postLogs,
    insights,
    brandPersonas,
    apiCredentials,
    safetyChecks,
    errorLogs,
    fortuneCalendar,
    imagePrompts,
    imageMotifs
  ] = await Promise.all([
    fetchRows("accounts", 50),
    fetchRows("settings", 100),
    fetchRows("buzz_posts", 1000),
    fetchRows("post_ideas", 1000),
    fetchRows("post_reservations", 1000),
    fetchRows("post_logs", 1000),
    fetchRows("insights", 1000),
    fetchRows("brand_personas", 50),
    fetchRows("api_credentials", 100),
    fetchRows("safety_checks", 200),
    fetchRows("error_logs", 200),
    fetchRows("fortune_calendar", 200),
    fetchRows("image_prompts", 1000),
    fetchRows("image_motifs", 500)
  ]);

  const settingLimit = settings.find((row) => toText(row.setting_key) === "daily_post_limit")?.setting_value;
  const dailyLimit = toNumber(typeof settingLimit === "object" && settingLimit ? (settingLimit as Row).value : settingLimit, DEFAULT_DAILY_POST_LIMIT);
  const todayReservations = reservations.filter((row) => isToday(getDate(row, ["scheduled_at"])));
  const usedSlots = todayReservations.filter((row) => ["scheduled", "posted"].includes(toText(row.status))).length;
  const recentBuzz = buzzPosts.filter((row) => isWithinDays(getDate(row, ["posted_at", "collected_at", "created_at"]), 7));
  const todayIdeas = ideas.filter((row) => isToday(getDate(row, ["created_at"])));
  const recentIdeas = todayIdeas.length ? todayIdeas : ideas.filter((row) => isWithinDays(getDate(row, ["created_at"]), 7));
  const riskDistribution = recentIdeas.reduce<Record<string, number>>((acc, row) => {
    const risk = normalizeRisk(row);
    acc[risk] = (acc[risk] ?? 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0, blocked: 0 });
  const templateRisk =
    riskDistribution.blocked > 0 ? "blocked" : riskDistribution.high > 0 ? "high" : riskDistribution.medium > riskDistribution.low ? "medium" : "low";

  const postedCount = reservations.filter((row) => toText(row.status) === "posted").length || postLogs.filter((row) => toText(row.status) === "success").length;
  const errorCount = reservations.filter((row) => toText(row.status) === "error").length || postLogs.filter((row) => toText(row.status) === "error").length;
  const postSuccessRate = postedCount + errorCount > 0 ? percent(postedCount, postedCount + errorCount) : null;

  const hookDupRate = duplicateRate(recentIdeas.map((row) => toText(row.hook) || toText(row.hook_text)));
  const ctaDupRate = duplicateRate(recentIdeas.map((row) => toText(row.cta) || toText(row.cta_text)));
  const originality = Math.max(0, Math.round(100 - (average(recentIdeas.map((row) => toNumber(row.competitor_similarity_score))) ?? 0)));
  const hookDiversityScore = Math.max(0, 100 - hookDupRate);
  const ctaNaturalnessScore = Math.max(0, 100 - ctaDupRate);
  const interval = calculatePostIntervals(reservations.filter((row) => isWithinDays(getDate(row, ["scheduled_at"]), 7)));
  const userPerspectiveScore = Math.round(
    average(recentIdeas.map((row) => toNumber(row.human_score)).filter(Boolean)) ??
      (templateRisk === "low" ? 80 : templateRisk === "medium" ? 62 : 42)
  );
  const editorialScore = Math.round(
    average([originality, hookDiversityScore, ctaNaturalnessScore, interval.tone === "good" ? 86 : 55, userPerspectiveScore]) ?? 0
  );

  const postTypes = recentIdeas.map((row) => toText(row.post_type)).filter(Boolean);
  const fortunePostCount = postTypes.filter((type) => ["占い結果型", "今日の運勢型", "前兆サイン型"].includes(type)).length;
  const postTypeCounts = groupCount(postTypes);
  const maxPostTypeRate = postTypeCounts.length ? percent(postTypeCounts[0][1], postTypes.length) : 0;

  const brand = brandPersonas[0];
  const threadsErrors = errorLogs.filter((row) => toText(row.source).includes("threads") && isWithinDays(getDate(row, ["created_at"]), 7));
  const credential = apiCredentials.find((row) => toText(row.provider).toLowerCase().includes("threads")) ?? apiCredentials[0];
  const tokenExpiresAt = getDate(credential ?? {}, ["expires_at"]);
  const apiConfigured = Boolean(process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_USER_ID);
  const duplicateTexts = duplicateRate([
    ...reservations.map((row) => toText(row.text) || toText(row.body)),
    ...ideas.map((row) => toText(row.full_text) || toText(row.body))
  ]);
  const ngHits = [...blockedExpressions, ...cautionExpressions].filter((word) =>
    [...reservations, ...ideas].some((row) => (toText(row.text) || toText(row.body) || toText(row.full_text)).includes(word))
  );

  const topPosts = buzzPosts
    .slice()
    .sort((a, b) => toNumber(b.buzz_score) - toNumber(a.buzz_score))
    .slice(0, 20)
    .map((row, index) => ({
      rank: index + 1,
      hook: toText(row.hook_text) || toText(row.body).slice(0, 42),
      author: toText(row.author_handle, "-"),
      genre: toText(row.detected_genre) || toText(row.genre, "未分類"),
      pattern: toText(row.pattern_type) || toText(row.pattern_name, "未分類"),
      postType: toText(row.post_type, "未分類"),
      buzzScore: Math.round(toNumber(row.buzz_score)),
      likes: Math.round(toNumber(row.like_count)),
      replies: Math.round(toNumber(row.reply_count)),
      confidence: toNumber(row.data_confidence, toText(row.data_confidence_level) === "high" ? 0.9 : 0.5)
    }));

  const genreMap = new Map<string, { count: number; score: number }>();
  buzzPosts.forEach((row) => {
    const genre = toText(row.detected_genre) || toText(row.genre, "未分類");
    const current = genreMap.get(genre) ?? { count: 0, score: 0 };
    genreMap.set(genre, { count: current.count + 1, score: current.score + toNumber(row.buzz_score) });
  });
  const recommendedGenres = [...genreMap.entries()]
    .map(([name, value], index) => ({
      rank: index + 1,
      name,
      score: Math.round(value.score / Math.max(1, value.count)),
      reason: `${value.count}件の投稿データから算出`
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const hookRanking = groupCount(buzzPosts.map((row) => toText(row.hook_text) || toText(row.body).slice(0, 40)))
    .slice(0, 10)
    .map(([hook, uses], index) => {
      const related = buzzPosts.filter((row) => (toText(row.hook_text) || toText(row.body).slice(0, 40)) === hook);
      return {
        rank: index + 1,
        hook,
        uses,
        averageScore: Math.round(average(related.map((row) => toNumber(row.buzz_score))) ?? 0)
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore);

  const schedule = reservations
    .slice()
    .sort((a, b) => (getDate(a, ["scheduled_at"])?.getTime() ?? 0) - (getDate(b, ["scheduled_at"])?.getTime() ?? 0))
    .slice(0, 6)
    .map((row) => ({
      time: getDate(row, ["scheduled_at"])
        ? new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", timeZone: APP_TIMEZONE }).format(getDate(row, ["scheduled_at"])!)
        : "--:--",
      genre: toText(row.genre, "未分類"),
      title: (toText(row.text) || toText(row.body) || "予約投稿").split(/\r?\n/)[0],
      status: toText(row.status, "draft")
    }));

  const quickStats = {
    totalFollowers: Number.isFinite(toNumber(accounts[0]?.follower_count, NaN)) ? toNumber(accounts[0]?.follower_count) : null,
    totalImpressions: insights.reduce((sum, row) => sum + toNumber(row.view_count), 0),
    reposts: insights.reduce((sum, row) => sum + toNumber(row.repost_count), 0),
    likes: insights.reduce((sum, row) => sum + toNumber(row.like_count), 0),
    replies: insights.reduce((sum, row) => sum + toNumber(row.reply_count), 0)
  };

  const header = buildHeader(accounts, errorLogs, usedSlots, dailyLimit, templateRisk);
  const hasData = buzzPosts.length + ideas.length + reservations.length + insights.length > 0;

  return {
    isFallback: !hasData,
    kpis: {
      totalCollectedPosts: buzzPosts.length,
      averageBuzzScore: average(recentBuzz.map((row) => toNumber(row.buzz_score))),
      todayPostSlots: { used: usedSlots, limit: dailyLimit },
      postSuccessRate,
      averageHumanScore: average(recentIdeas.map((row) => toNumber(row.human_score)).filter(Boolean)),
      templateRisk,
      templateRiskDistribution: riskDistribution
    },
    editorialCheck: {
      score: editorialScore,
      originality: toneFromScore(originality),
      hookDiversity: toneFromScore(hookDiversityScore),
      ctaNaturalness: toneFromScore(ctaNaturalnessScore),
      postInterval: interval.tone as DashboardTone,
      userPerspective: toneFromScore(userPerspectiveScore),
      details: {
        originality: `${originality}/100`,
        hookDiversity: `重複率 ${hookDupRate}%`,
        ctaNaturalness: `重複率 ${ctaDupRate}%`,
        postInterval: interval.label,
        userPerspective: `${userPerspectiveScore}/100`
      }
    },
    templateRiskSummary: {
      fortunePostRatio: percent(fortunePostCount, Math.max(1, postTypes.length)),
      sameCtaRate: ctaDupRate,
      similarPostCount: recentIdeas.filter((row) => toNumber(row.competitor_similarity_score) >= 70).length,
      postTypeSkew: maxPostTypeRate >= 70 ? "high" : maxPostTypeRate >= 50 ? "medium" : "low",
      maxPostTypeRate
    },
    brandPersona: brand
      ? {
          isConfigured: true,
          tone: toText(brand.tone, "未設定"),
          commonPhrases: toArray(brand.common_phrases),
          worldview: toText(brand.worldview, "未設定"),
          targetReader: toText(brand.target_reader, "未設定"),
          bannedPhrases: toArray(brand.banned_phrases),
          ctaStyle: toText(brand.cta_style, "未設定")
        }
      : { isConfigured: false },
    safety: {
      apiStatus: threadsErrors.length ? "要確認" : apiConfigured ? "正常" : "未設定",
      tokenStatus: tokenExpiresAt
        ? `${Math.ceil((tokenExpiresAt.getTime() - Date.now()) / 86400000)}日`
        : apiConfigured
          ? "環境変数管理"
          : "未設定",
      postInterval: interval.label,
      duplicatePosts: duplicateTexts > 0 ? `${duplicateTexts}%` : "なし",
      ngWords: ngHits.length ? `${ngHits.length}件` : "なし",
      ctaDuplicate: ctaDupRate > 0 ? `${ctaDupRate}%` : "なし",
      overallStatus: header.operationStatus
    },
    recommendedIdeas: buildRecommendedIdeas(recentIdeas.length ? recentIdeas : ideas),
    postTypeBalance: buildPostTypeBalance(reservations, ideas, insights),
    fortuneCalendar: fortuneCalendar
      .filter((row) => {
        const date = getDate(row, ["date"]);
        if (!date) return false;
        const diff = date.getTime() - new Date(formatDateKey(new Date())).getTime();
        return diff >= -86400000 && diff <= 14 * 86400000;
      })
      .sort((a, b) => (getDate(a, ["date"])?.getTime() ?? 0) - (getDate(b, ["date"])?.getTime() ?? 0))
      .slice(0, 14)
      .map((row) => ({
        date: toText(row.date),
        eventName: toText(row.event_name),
        eventType: toText(row.event_type, "イベント"),
        relatedGenre: toText(row.related_genre, "未分類"),
        importanceScore: Math.round(toNumber(row.importance_score)),
        suggestedAngle: toText(row.suggested_angle, "未設定"),
        ngAngle: toText(row.ng_angle, "未設定")
      })),
    motifReuse: buildMotifReuse(
      buzzPosts.filter((row) => isWithinDays(getDate(row, ["posted_at", "created_at"]), 7)),
      imagePrompts.filter((row) => isWithinDays(getDate(row, ["created_at"]), 7)),
      imageMotifs,
      insights.filter((row) => isWithinDays(getDate(row, ["collected_at", "captured_at", "created_at"]), 7))
    ),
    quickStats,
    header,
    topPosts,
    recommendedGenres,
    hookRanking,
    schedule,
    diagnostics: {
      safetyCheckCount: safetyChecks.length,
      apiCredentialCount: apiCredentials.length,
      recentErrorCount: errorLogs.filter((row) => isWithinDays(getDate(row, ["created_at"]), 7)).length
    }
  };
}

export async function adoptDashboardIdea(ideaId: string) {
  return updateIdeaStatus(ideaId, "adopted");
}
