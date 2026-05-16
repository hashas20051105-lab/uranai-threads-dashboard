import { DEFAULT_USER_ID } from "@/lib/constants";
import { buildDailyReportPayload } from "@/lib/reports/daily-report";
import { buildWeeklyReportPayload } from "@/lib/reports/weekly-report";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { buildInsightDashboardData } from "@/services/insight-service";
import { saveErrorLog } from "@/services/error-log-service";
import type { PostInsight, ReportType, SavedReport } from "@/types/domain";

type Row = Record<string, any>;

export async function listReports(): Promise<SavedReport[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as Row[]).map(mapReportRow);
}

export async function generateDailyReport(reportDate = todayJst()) {
  return generateReport("daily", reportDate);
}

export async function generateWeeklyReport(reportDate = todayJst()) {
  return generateReport("weekly", reportDate);
}

async function generateReport(type: ReportType, reportDate: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing" };
  const range = type === "daily" ? dayRange(reportDate) : weekRange(reportDate);
  const { data, error } = await supabase
    .from("insights")
    .select("*,post_reservations(text,body,posted_at)")
    .eq("user_id", DEFAULT_USER_ID)
    .gte("collected_at", range.start)
    .lte("collected_at", range.end)
    .order("buzz_score", { ascending: false });

  if (error) {
    await saveErrorLog({ source: `${type}_report`, route: `services/report-service:${type}`, errorType: "db_error", message: error.message });
    return { ok: false, error: migrationMessage(error.message) };
  }

  const insights = ((data ?? []) as Row[]).map(mapInsightForReport);
  const dashboardData = buildInsightDashboardData(insights);
  const payload = type === "daily" ? buildDailyReportPayload(reportDate, dashboardData) : buildWeeklyReportPayload(reportDate, dashboardData);
  const row = {
    user_id: DEFAULT_USER_ID,
    report_type: payload.reportType,
    report_date: payload.reportDate,
    target_date: payload.reportDate,
    summary: payload.summary,
    top_genres: payload.topGenres,
    top_hooks: payload.topHooks,
    top_patterns: payload.topPatterns,
    top_post_types: payload.topPostTypes,
    top_motifs: payload.topMotifs,
    template_risk_summary: payload.templateRiskSummary,
    competitor_ranking: payload.competitorRanking,
    next_recommendations: payload.nextRecommendations,
    chatgpt_prompt: payload.chatgptPrompt
  };

  const { data: saved, error: saveError } = await supabase.from("reports").insert(row).select("*").maybeSingle();
  if (saveError) {
    await saveErrorLog({ source: `${type}_report`, route: `services/report-service:${type}:save`, errorType: "db_error", message: saveError.message });
    return { ok: false, error: migrationMessage(saveError.message) };
  }

  return { ok: true, report: mapReportRow(saved as Row) };
}

function mapReportRow(row: Row): SavedReport {
  return {
    id: row.id,
    reportType: row.report_type === "weekly" ? "weekly" : "daily",
    reportDate: row.report_date ?? row.target_date,
    summary: row.summary ?? null,
    topGenres: Array.isArray(row.top_genres) ? row.top_genres : [],
    topHooks: Array.isArray(row.top_hooks) ? row.top_hooks : [],
    topPatterns: Array.isArray(row.top_patterns) ? row.top_patterns : [],
    topPostTypes: Array.isArray(row.top_post_types) ? row.top_post_types : [],
    topMotifs: Array.isArray(row.top_motifs) ? row.top_motifs : [],
    templateRiskSummary: row.template_risk_summary ?? {},
    competitorRanking: Array.isArray(row.competitor_ranking) ? row.competitor_ranking : [],
    nextRecommendations: Array.isArray(row.next_recommendations) ? row.next_recommendations : [],
    chatgptPrompt: row.chatgpt_prompt ?? null,
    createdAt: row.created_at
  };
}

function mapInsightForReport(row: Row): PostInsight {
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
    engagementTotal: Number(row.engagement_total ?? 0),
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

function dayRange(date: string) {
  return { start: `${date}T00:00:00+09:00`, end: `${date}T23:59:59+09:00` };
}

function weekRange(date: string) {
  const base = new Date(`${date}T00:00:00+09:00`);
  const day = base.getDay();
  const start = new Date(base);
  start.setDate(base.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: start.toISOString(), end: end.toISOString() };
}

function todayJst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

function migrationMessage(message: string) {
  return /column .* does not exist|schema cache|reports|insights/i.test(message)
    ? "SupabaseにPhase 6用カラムがまだありません。007_phase6_insights_reports.sql をSQL Editorで実行してください。"
    : message;
}

