import { DEFAULT_USER_ID } from "@/lib/constants";
import {
  calculateInsightBuzzScore,
  calculateInsightEngagement,
  deriveInsightConfidence,
  getMissingInsightFields,
  nearestInsightHour
} from "@/lib/scoring/insight-score";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { fetchThreadsMediaInsights, ThreadsApiError } from "@/lib/threads/client";
import { saveErrorLog } from "@/services/error-log-service";
import type { InsightAggregate, InsightCollectResult, InsightDashboardData, InsightMetricInput, PostInsight } from "@/types/domain";

type Row = Record<string, any>;
type NormalizedInsightMetrics = {
  viewCount: number | null;
  likeCount: number | null;
  replyCount: number | null;
  repostCount: number | null;
  quoteCount: number | null;
  rawPayload: unknown;
};

export async function listInsightDashboardData(): Promise<InsightDashboardData> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return emptyDashboardData();

  const { data } = await supabase
    .from("insights")
    .select("*,post_reservations(text,body,posted_at)")
    .eq("user_id", DEFAULT_USER_ID)
    .order("collected_at", { ascending: false })
    .limit(300);

  const insights = ((data ?? []) as Row[]).map(mapInsightRow);
  return buildInsightDashboardData(insights);
}

export async function collectPostedInsights(): Promise<InsightCollectResult> {
  const checkedAt = new Date().toISOString();
  const reservations = await loadPostedReservations();
  let savedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const reservation of reservations) {
    const hoursAfterPost = nearestInsightHour(hoursBetween(reservation.posted_at, checkedAt));
    if (await insightExists(reservation.id, hoursAfterPost, "api")) {
      skippedCount += 1;
      continue;
    }

    const result = await collectOneInsight({ reservationId: reservation.id, hoursAfterPost });
    if (result.ok) savedCount += result.savedCount;
    else {
      errorCount += 1;
      errors.push(...result.errors);
    }
  }

  return { ok: errorCount === 0, checkedAt, targetCount: reservations.length, savedCount, skippedCount, errorCount, errors };
}

export async function collectOneInsight(input: { reservationId?: string; threadsPostId?: string; hoursAfterPost?: number; manualMetrics?: InsightMetricInput }) {
  const checkedAt = new Date().toISOString();
  const reservation = await loadPostedReservation(input);
  if (!reservation) {
    await logInsightError("insights_collect_one", "not_posted", "Posted reservation was not found", input);
    return { ok: false, checkedAt, targetCount: 0, savedCount: 0, skippedCount: 0, errorCount: 1, errors: ["Posted reservation was not found"] };
  }

  if (!reservation.threads_post_id) {
    await logInsightError("insights_collect_one", "missing_threads_post_id", "threads_post_id is missing", { reservation_id: reservation.id });
    return { ok: false, checkedAt, targetCount: 1, savedCount: 0, skippedCount: 0, errorCount: 1, errors: ["threads_post_id is missing"] };
  }

  const hoursAfterPost = input.hoursAfterPost ?? nearestInsightHour(hoursBetween(reservation.posted_at, checkedAt));
  const dataSource = input.manualMetrics ? "manual" : "api";
  if (await insightExists(reservation.id, hoursAfterPost, dataSource)) {
    return { ok: true, checkedAt, targetCount: 1, savedCount: 0, skippedCount: 1, errorCount: 0, errors: [] };
  }

  try {
    const metrics = input.manualMetrics ? normalizeManualMetrics(input.manualMetrics) : await fetchThreadsMediaInsights(reservation.threads_post_id);
    const saved = await saveInsight(reservation, metrics, dataSource, checkedAt, hoursAfterPost, input.manualMetrics?.memo ?? null);
    return { ok: saved.ok, checkedAt, targetCount: 1, savedCount: saved.ok ? 1 : 0, skippedCount: 0, errorCount: saved.ok ? 0 : 1, errors: saved.ok ? [] : [saved.error ?? "Failed to save insight"] };
  } catch (caught) {
    const error = normalizeError(caught);
    await logInsightError("insights_collect_one", error.errorType, error.message, { reservation_id: reservation.id, status: error.status });
    return { ok: false, checkedAt, targetCount: 1, savedCount: 0, skippedCount: 0, errorCount: 1, errors: [error.message] };
  }
}

export async function saveManualInsight(input: { reservationId: string; metrics: InsightMetricInput }) {
  return collectOneInsight({ reservationId: input.reservationId, manualMetrics: input.metrics });
}

export function buildInsightDashboardData(insights: PostInsight[]): InsightDashboardData {
  return {
    insights,
    byGenre: aggregate(insights, (insight) => insight.genre),
    byPattern: aggregate(insights, (insight) => insight.patternType),
    byPostType: aggregate(insights, (insight) => insight.postType),
    byHook: aggregate(insights, (insight) => insight.hook),
    byCta: aggregate(insights, (insight) => insight.cta),
    byMotif: aggregateMulti(insights, (insight) => insight.visualMotifs),
    byTemplateRisk: aggregate(insights, (insight) => insight.templateRisk),
    byHumanScore: aggregate(insights, (insight) => humanScoreBucket(insight.humanScore)),
    timeSeries: buildTimeSeries(insights)
  };
}

async function loadPostedReservations() {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("post_reservations")
    .select("*,post_ideas(genre,post_type,pattern_type,hook,hook_text,cta,cta_text,human_score,template_risk,full_text,body)")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "posted")
    .eq("approved_by_human", true)
    .not("threads_post_id", "is", null)
    .not("posted_at", "is", null)
    .order("posted_at", { ascending: false })
    .limit(100);

  if (error) {
    await logInsightError("insights_collect", "db_error", error.message, {});
    return [];
  }
  return (data ?? []) as Row[];
}

async function loadPostedReservation(input: { reservationId?: string; threadsPostId?: string }) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return null;
  let query = supabase
    .from("post_reservations")
    .select("*,post_ideas(genre,post_type,pattern_type,hook,hook_text,cta,cta_text,human_score,template_risk,full_text,body)")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "posted")
    .eq("approved_by_human", true);

  if (input.reservationId) query = query.eq("id", input.reservationId);
  else if (input.threadsPostId) query = query.eq("threads_post_id", input.threadsPostId);
  else return null;

  const { data, error } = await query.maybeSingle();
  if (error) {
    await logInsightError("insights_collect_one", "db_error", error.message, input);
    return null;
  }
  return data as Row | null;
}

async function insightExists(reservationId: string, hoursAfterPost: number, dataSource: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("insights")
    .select("id")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("reservation_id", reservationId)
    .eq("hours_after_post", hoursAfterPost)
    .eq("data_source", dataSource)
    .limit(1);
  return Boolean(data?.length);
}

async function saveInsight(reservation: Row, metrics: NormalizedInsightMetrics, dataSource: "api" | "manual", collectedAt: string, hoursAfterPost: number, memo: string | null) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing" };
  const idea = reservation.post_ideas ?? {};
  const engagementTotal = calculateInsightEngagement(metrics);
  const buzzScore = calculateInsightBuzzScore(metrics);
  const missingFields = getMissingInsightFields(metrics);
  const row = {
    user_id: DEFAULT_USER_ID,
    account_id: reservation.account_id ?? null,
    reservation_id: reservation.id,
    idea_id: reservation.idea_id ?? null,
    threads_post_id: reservation.threads_post_id,
    collected_at: collectedAt,
    captured_at: collectedAt,
    hours_after_post: hoursAfterPost,
    elapsed_hours: hoursAfterPost,
    view_count: metrics.viewCount ?? 0,
    like_count: metrics.likeCount ?? 0,
    reply_count: metrics.replyCount ?? 0,
    repost_count: metrics.repostCount ?? 0,
    quote_count: metrics.quoteCount ?? 0,
    engagement_total: engagementTotal,
    buzz_score: buzzScore,
    genre: idea.genre ?? null,
    pattern_type: idea.pattern_type ?? null,
    post_type: idea.post_type ?? reservation.post_type ?? null,
    hook: idea.hook ?? idea.hook_text ?? null,
    cta: idea.cta ?? idea.cta_text ?? null,
    visual_motifs: Array.isArray(idea.visual_motifs) ? idea.visual_motifs : [],
    human_score: idea.human_score ?? null,
    template_risk: idea.template_risk ?? null,
    data_source: dataSource,
    data_confidence: deriveInsightConfidence(metrics),
    missing_fields: missingFields,
    memo,
    raw_payload: "rawPayload" in metrics ? metrics.rawPayload : {}
  };

  const { error } = await supabase.from("insights").insert(row);
  if (error) {
    await logInsightError("insight_save", "db_error", error.message, { reservation_id: reservation.id });
    return { ok: false, error: migrationMessage(error.message) };
  }
  return { ok: true };
}

function normalizeManualMetrics(input: InsightMetricInput) {
  return {
    viewCount: input.view_count ?? null,
    likeCount: input.like_count ?? null,
    replyCount: input.reply_count ?? null,
    repostCount: input.repost_count ?? null,
    quoteCount: input.quote_count ?? null,
    rawPayload: { source: "manual" }
  };
}

function mapInsightRow(row: Row): PostInsight {
  return {
    id: row.id,
    reservationId: row.reservation_id ?? null,
    ideaId: row.idea_id ?? null,
    threadsPostId: row.threads_post_id ?? null,
    collectedAt: row.collected_at ?? row.captured_at,
    hoursAfterPost: row.hours_after_post ?? row.elapsed_hours ?? null,
    viewCount: Number(row.view_count ?? 0),
    likeCount: Number(row.like_count ?? 0),
    replyCount: Number(row.reply_count ?? 0),
    repostCount: Number(row.repost_count ?? 0),
    quoteCount: Number(row.quote_count ?? 0),
    engagementTotal: Number(row.engagement_total ?? calculateInsightEngagement({ likeCount: row.like_count, replyCount: row.reply_count, repostCount: row.repost_count, quoteCount: row.quote_count })),
    buzzScore: Number(row.buzz_score ?? 0),
    genre: row.genre ?? null,
    patternType: row.pattern_type ?? null,
    postType: row.post_type ?? null,
    hook: row.hook ?? null,
    cta: row.cta ?? null,
    visualMotifs: Array.isArray(row.visual_motifs) ? row.visual_motifs.map(String) : [],
    humanScore: row.human_score === null || row.human_score === undefined ? null : Number(row.human_score),
    templateRisk: row.template_risk ?? null,
    dataSource: row.data_source === "manual" ? "manual" : "api",
    dataConfidence: row.data_confidence ?? "low",
    missingFields: Array.isArray(row.missing_fields) ? row.missing_fields.map(String) : [],
    text: row.post_reservations?.text ?? row.post_reservations?.body ?? null,
    postedAt: row.post_reservations?.posted_at ?? null
  };
}

function aggregate(insights: PostInsight[], keyFn: (insight: PostInsight) => string | null | undefined): InsightAggregate[] {
  const map = new Map<string, PostInsight[]>();
  for (const insight of insights) {
    const key = keyFn(insight) || "unknown";
    map.set(key, [...(map.get(key) ?? []), insight]);
  }
  return [...map.entries()].map(([key, rows]) => toAggregate(key, rows)).sort((a, b) => b.averageBuzzScore - a.averageBuzzScore);
}

function aggregateMulti(insights: PostInsight[], keyFn: (insight: PostInsight) => string[]): InsightAggregate[] {
  const expanded: PostInsight[] = [];
  const keys: string[] = [];
  for (const insight of insights) {
    const values = keyFn(insight);
    if (values.length === 0) {
      expanded.push(insight);
      keys.push("unknown");
    } else {
      for (const value of values) {
        expanded.push(insight);
        keys.push(value);
      }
    }
  }
  const map = new Map<string, PostInsight[]>();
  expanded.forEach((insight, index) => map.set(keys[index], [...(map.get(keys[index]) ?? []), insight]));
  return [...map.entries()].map(([key, rows]) => toAggregate(key, rows)).sort((a, b) => b.averageBuzzScore - a.averageBuzzScore);
}

function toAggregate(key: string, rows: PostInsight[]): InsightAggregate {
  const count = rows.length || 1;
  const viewTotal = rows.reduce((sum, row) => sum + row.viewCount, 0);
  return {
    key,
    averageBuzzScore: round(rows.reduce((sum, row) => sum + row.buzzScore, 0) / count),
    averageEngagementTotal: round(rows.reduce((sum, row) => sum + row.engagementTotal, 0) / count),
    count: rows.length,
    replyRate: round(ratio(rows.reduce((sum, row) => sum + row.replyCount, 0), viewTotal)),
    repostRate: round(ratio(rows.reduce((sum, row) => sum + row.repostCount, 0), viewTotal))
  };
}

function buildTimeSeries(insights: PostInsight[]) {
  return aggregate(insights, (insight) => `${insight.hoursAfterPost ?? 0}h`).map((row) => ({
    label: row.key,
    buzzScore: row.averageBuzzScore,
    engagementTotal: row.averageEngagementTotal,
    count: row.count
  }));
}

function humanScoreBucket(value: number | null) {
  if (value === null) return "unknown";
  if (value >= 85) return "85+";
  if (value >= 70) return "70-84";
  if (value >= 55) return "55-69";
  return "under 55";
}

function hoursBetween(start: string | null | undefined, end: string) {
  if (!start) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60 / 60);
}

function ratio(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function emptyDashboardData(): InsightDashboardData {
  return {
    insights: [],
    byGenre: [],
    byPattern: [],
    byPostType: [],
    byHook: [],
    byCta: [],
    byMotif: [],
    byTemplateRisk: [],
    byHumanScore: [],
    timeSeries: []
  };
}

function normalizeError(caught: unknown) {
  if (caught instanceof ThreadsApiError) return { errorType: caught.errorType, message: caught.message, status: caught.status };
  if (caught instanceof Error) return { errorType: "unknown", message: caught.message };
  return { errorType: "unknown", message: "Unknown insight error" };
}

async function logInsightError(source: string, errorType: string, message: string, details: Record<string, unknown>) {
  await saveErrorLog({ source, route: `services/insight-service:${source}`, errorType, message, details });
}

function migrationMessage(message: string) {
  return /column .* does not exist|schema cache|insights|reports/i.test(message)
    ? "SupabaseにPhase 6用カラムがまだありません。007_phase6_insights_reports.sql をSQL Editorで実行してください。"
    : message;
}
