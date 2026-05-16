import { DEFAULT_USER_ID } from "@/lib/constants";
import { runPrePublishCheck } from "@/lib/safety/pre-publish-check";
import { extractCtaFromText } from "@/lib/safety/cta-rotation";
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { saveErrorLog } from "@/services/error-log-service";
import type {
  PrePublishCheckResult,
  Reservation,
  ReservationCandidateIdea,
  ReservationInput,
  ReservationPostType,
  ReservationStatus,
  TemplateRiskLevel
} from "@/types/domain";

const DEFAULT_ACCOUNT_ID = "11111111-1111-1111-1111-111111111111";

type ReservationRow = Record<string, any>;
type IdeaRow = Record<string, any>;

export async function listReservationCandidateIdeas(): Promise<ReservationCandidateIdea[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("post_ideas")
    .select("id,account_id,genre,post_type,pattern_type,hook,hook_text,cta,cta_text,full_text,body,status,template_risk,human_score,competitor_similarity_score,publish_decision,decision")
    .eq("user_id", DEFAULT_USER_ID)
    .in("status", ["adopted", "needs_edit"])
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as IdeaRow[]).map(mapIdeaRow).filter(Boolean);
}

export async function listReservations(): Promise<Reservation[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("post_reservations")
    .select("*,post_ideas(genre,post_type,template_risk,human_score)")
    .eq("user_id", DEFAULT_USER_ID)
    .order("scheduled_at", { ascending: true })
    .limit(200);

  return ((data ?? []) as ReservationRow[]).map(mapReservationRow);
}

export async function listScheduleReservations() {
  const reservations = await listReservations();
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return reservations.filter((reservation) => {
    const scheduled = new Date(reservation.scheduledAt);
    return scheduled >= new Date(now.toDateString()) && scheduled <= weekEnd && reservation.status !== "cancelled";
  });
}

export async function previewPrePublishCheck(input: ReservationInput): Promise<{ ok: boolean; precheck?: PrePublishCheckResult; error?: string }> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabaseのサーバー接続情報が未設定です。" };

  const idea = await loadIdea(input.idea_id);
  if (!idea) return { ok: false, error: "投稿案が見つかりません。" };

  const context = await loadReservationContext(input.idea_id);
  const precheck = runPrePublishCheck({
    idea,
    scheduledAt: input.scheduled_at,
    reservationPostType: input.post_type,
    text: input.text,
    imageUrl: input.image_url,
    videoUrl: input.video_url,
    latestReservation: context.latestReservation,
    existingScheduledTimes: context.existingScheduledTimes
  });

  return { ok: true, precheck };
}

export async function createReservation(input: ReservationInput) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabaseのサーバー接続情報が未設定です。" };

  try {
    const validation = validateReservationInput(input);
    if (validation) return { ok: false, error: validation };

    const idea = await loadIdea(input.idea_id);
    if (!idea) return { ok: false, error: "投稿案が見つかりません。" };

    const context = await loadReservationContext(input.idea_id);
    const precheck = runPrePublishCheck({
      idea,
      scheduledAt: input.scheduled_at,
      reservationPostType: input.post_type,
      text: input.text,
      imageUrl: input.image_url,
      videoUrl: input.video_url,
      latestReservation: context.latestReservation,
      existingScheduledTimes: context.existingScheduledTimes
    });

    if (!precheck.canReserve) {
      return { ok: false, error: "予約不可条件があります。内容を修正してください。", precheck };
    }

    const status: ReservationStatus = input.approved_by_human ? "scheduled" : "pending_approval";
    const row = buildReservationRow(input, precheck, status);
    const { data, error } = await supabase.from("post_reservations").insert(row).select("*,post_ideas(genre,post_type,template_risk,human_score)").maybeSingle();

    if (error) {
      await logReservationError("reservation_create", error.message, { idea_id: input.idea_id });
      return { ok: false, error: migrationMessage(error.message), precheck };
    }

    if (input.approved_by_human) {
      await supabase.from("post_ideas").update({ status: "reserved" }).eq("id", input.idea_id).eq("user_id", DEFAULT_USER_ID);
    }

    return { ok: true, reservation: mapReservationRow(data as ReservationRow), precheck };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "予約作成に失敗しました。";
    await logReservationError("reservation_create", message, { idea_id: input.idea_id });
    return { ok: false, error: message };
  }
}

export async function updateReservation(input: ReservationInput & { reservation_id: string; status?: ReservationStatus }) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabaseのサーバー接続情報が未設定です。" };

  try {
    const validation = validateReservationInput(input);
    if (validation) return { ok: false, error: validation };

    const idea = await loadIdea(input.idea_id);
    if (!idea) return { ok: false, error: "投稿案が見つかりません。" };

    const context = await loadReservationContext(input.idea_id, input.reservation_id);
    const precheck = runPrePublishCheck({
      idea,
      scheduledAt: input.scheduled_at,
      reservationPostType: input.post_type,
      text: input.text,
      imageUrl: input.image_url,
      videoUrl: input.video_url,
      latestReservation: context.latestReservation,
      existingScheduledTimes: context.existingScheduledTimes
    });

    if (!precheck.canReserve && input.status !== "draft") {
      return { ok: false, error: "予約不可条件があります。内容を修正してください。", precheck };
    }

    const status: ReservationStatus = input.status === "draft" ? "draft" : input.approved_by_human ? "scheduled" : "pending_approval";
    const { data, error } = await supabase
      .from("post_reservations")
      .update(buildReservationRow(input, precheck, status))
      .eq("id", input.reservation_id)
      .eq("user_id", DEFAULT_USER_ID)
      .select("*,post_ideas(genre,post_type,template_risk,human_score)")
      .maybeSingle();

    if (error) {
      await logReservationError("reservation_update", error.message, { reservation_id: input.reservation_id });
      return { ok: false, error: migrationMessage(error.message), precheck };
    }

    return { ok: true, reservation: mapReservationRow(data as ReservationRow), precheck };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "予約更新に失敗しました。";
    await logReservationError("reservation_update", message, { reservation_id: input.reservation_id });
    return { ok: false, error: message };
  }
}

export async function cancelReservation(reservationId: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabaseのサーバー接続情報が未設定です。" };

  const { data, error } = await supabase
    .from("post_reservations")
    .update({ status: "cancelled", error_message: null })
    .eq("id", reservationId)
    .eq("user_id", DEFAULT_USER_ID)
    .select("*,post_ideas(genre,post_type,template_risk,human_score)")
    .maybeSingle();

  if (error) {
    await logReservationError("reservation_cancel", error.message, { reservation_id: reservationId });
    return { ok: false, error: error.message };
  }

  return { ok: true, reservation: mapReservationRow(data as ReservationRow) };
}

export async function clearReservationError(reservationId: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing." };

  const { data, error } = await supabase
    .from("post_reservations")
    .update({
      status: "scheduled",
      error_message: null,
      retry_count: 0,
      last_error_type: null,
      last_attempted_at: null
    })
    .eq("id", reservationId)
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "error")
    .is("threads_post_id", null)
    .select("*,post_ideas(genre,post_type,template_risk,human_score)")
    .maybeSingle();

  if (error) {
    await logReservationError("reservation_clear_error", error.message, { reservation_id: reservationId });
    return { ok: false, error: migrationMessage(error.message) };
  }

  return { ok: true, reservation: data ? mapReservationRow(data as ReservationRow) : null };
}

function validateReservationInput(input: ReservationInput) {
  if (!input.idea_id) return "投稿案を選択してください。";
  if (!input.scheduled_at || Number.isNaN(new Date(input.scheduled_at).getTime())) return "予約日時を入力してください。";
  if (!input.text?.trim()) return "投稿本文を入力してください。";
  if (!["TEXT", "IMAGE", "VIDEO", "THREAD"].includes(input.post_type)) return "投稿タイプが不正です。";
  return null;
}

async function loadIdea(ideaId: string): Promise<ReservationCandidateIdea | null> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("post_ideas")
    .select("id,account_id,genre,post_type,pattern_type,hook,hook_text,cta,cta_text,full_text,body,status,template_risk,human_score,competitor_similarity_score,publish_decision,decision")
    .eq("id", ideaId)
    .eq("user_id", DEFAULT_USER_ID)
    .maybeSingle();

  return data ? mapIdeaRow(data as IdeaRow) : null;
}

async function loadReservationContext(ideaId: string, excludeReservationId?: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { latestReservation: null, existingScheduledTimes: [] };

  let query = supabase
    .from("post_reservations")
    .select("id,scheduled_at,text,body,status,post_ideas(genre,post_type)")
    .eq("user_id", DEFAULT_USER_ID)
    .in("status", ["pending_approval", "scheduled"])
    .order("scheduled_at", { ascending: false })
    .limit(20);

  if (excludeReservationId) {
    query = query.neq("id", excludeReservationId);
  }

  const { data } = await query;
  const rows = (data ?? []) as ReservationRow[];
  const latest = rows[0];

  return {
    latestReservation: latest
      ? {
          cta: extractCtaFromText(latest.text ?? latest.body ?? ""),
          genre: latest.post_ideas?.genre ?? null,
          postType: latest.post_ideas?.post_type ?? null
        }
      : null,
    existingScheduledTimes: rows.map((row) => row.scheduled_at).filter(Boolean)
  };
}

function buildReservationRow(input: ReservationInput, precheck: PrePublishCheckResult, status: ReservationStatus) {
  const mediaUrls = [input.image_url, input.video_url].filter(Boolean);
  return {
    user_id: DEFAULT_USER_ID,
    account_id: input.account_id || DEFAULT_ACCOUNT_ID,
    idea_id: input.idea_id,
    scheduled_at: input.scheduled_at,
    post_type: input.post_type,
    post_format: input.post_type,
    text: input.text,
    body: input.text,
    image_url: input.image_url || null,
    video_url: input.video_url || null,
    media_urls: mediaUrls,
    thread_group_id: input.thread_group_id || null,
    thread_order: input.thread_order ?? null,
    status,
    approved_by_human: input.approved_by_human,
    approved_by_user: input.approved_by_human,
    approved_at: input.approved_by_human ? new Date().toISOString() : null,
    posted_at: null,
    threads_post_id: null,
    error_message: null,
    precheck_result: precheck
  };
}

function mapIdeaRow(row: IdeaRow): ReservationCandidateIdea {
  const fullText = row.full_text || [row.hook ?? row.hook_text, row.body, row.cta ?? row.cta_text].filter(Boolean).join("\n\n");
  return {
    id: row.id,
    accountId: row.account_id ?? null,
    genre: row.genre ?? "総合占い",
    postType: row.post_type ?? "占い結果型",
    patternType: row.pattern_type ?? null,
    hook: row.hook ?? row.hook_text ?? row.title ?? "投稿案",
    cta: row.cta ?? row.cta_text ?? "",
    fullText,
    status: row.status ?? "draft",
    templateRisk: normalizeTemplateRisk(row.template_risk),
    humanScore: Number(row.human_score ?? 0),
    competitorSimilarityScore: Number(row.competitor_similarity_score ?? 0),
    publishDecision: row.publish_decision ?? row.decision ?? "保留推奨"
  };
}

function mapReservationRow(row: ReservationRow): Reservation {
  return {
    id: row.id,
    ideaId: row.idea_id ?? null,
    accountId: row.account_id ?? null,
    scheduledAt: row.scheduled_at,
    postType: (row.post_type ?? row.post_format ?? "TEXT") as ReservationPostType,
    text: row.text ?? row.body ?? "",
    imageUrl: row.image_url ?? null,
    videoUrl: row.video_url ?? null,
    threadGroupId: row.thread_group_id ?? null,
    threadOrder: row.thread_order ?? null,
    status: (row.status ?? "pending_approval") as ReservationStatus,
    approvedByHuman: Boolean(row.approved_by_human ?? row.approved_by_user),
    approvedAt: row.approved_at ?? null,
    postedAt: row.posted_at ?? null,
    threadsPostId: row.threads_post_id ?? null,
    errorMessage: row.error_message ?? null,
    retryCount: Number(row.retry_count ?? 0),
    lastAttemptedAt: row.last_attempted_at ?? null,
    lastErrorType: row.last_error_type ?? null,
    precheckResult: row.precheck_result ?? null,
    createdAt: row.created_at,
    idea: row.post_ideas
      ? {
          genre: row.post_ideas.genre ?? null,
          postType: row.post_ideas.post_type ?? null,
          templateRisk: row.post_ideas.template_risk ?? null,
          humanScore: row.post_ideas.human_score ?? null
        }
      : null
  };
}

function normalizeTemplateRisk(value: unknown): TemplateRiskLevel {
  if (value === "low" || value === "medium" || value === "high" || value === "blocked") return value;
  return "medium";
}

async function logReservationError(source: string, message: string, details: Record<string, unknown>) {
  await saveErrorLog({
    source,
    route: `services/reservation-service:${source}`,
    errorType: "reservation_error",
    message,
    details
  });
}

function migrationMessage(message: string) {
  return /column .* does not exist|schema cache|post_reservations|retry_count|last_attempted_at|last_error_type/i.test(message)
    ? "SupabaseにPhase 5予約用カラムがまだありません。005_phase5_reservations.sql をSQL Editorで実行してください。"
    : message;
}
