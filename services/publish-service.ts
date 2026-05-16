import { DEFAULT_USER_ID } from "@/lib/constants";
import { runFinalPublishCheck } from "@/lib/safety/final-publish-check";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { publishThreadsPost, ThreadsApiError } from "@/lib/threads/client";
import { saveErrorLog } from "@/services/error-log-service";
import type { PublishActionResult, PublishCheckResult, PublishDueResult, PublishTargetPreview, Reservation, ReservationPostType, ReservationStatus } from "@/types/domain";

const MAX_RETRY_COUNT = 3;
type ReservationRow = Record<string, any>;

export async function publishDueReservations({ dryRun = true, limit = 20 }: { dryRun?: boolean; limit?: number }): Promise<PublishDueResult> {
  const checkedAt = new Date().toISOString();
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return emptyDueResult(dryRun, checkedAt, "Supabase service role configuration is missing");
  }

  const { data, error } = await supabase
    .from("post_reservations")
    .select("*,post_ideas(genre,post_type,template_risk,human_score)")
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "scheduled")
    .lte("scheduled_at", checkedAt)
    .is("threads_post_id", null)
    .order("thread_group_id", { ascending: true, nullsFirst: false })
    .order("thread_order", { ascending: true, nullsFirst: true })
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    await logPublishError("publish_due", "db_error", error.message, {});
    return emptyDueResult(dryRun, checkedAt, migrationMessage(error.message));
  }

  const reservations = ((data ?? []) as ReservationRow[]).map(mapReservationRow);
  const results: PublishActionResult[] = [];

  for (const reservation of reservations) {
    results.push(await publishReservation(reservation, { dryRun, checkedAt }));
  }

  return {
    ok: results.every((result) => result.ok || result.status === "skipped"),
    mode: dryRun ? "dry_run" : "publish",
    checkedAt,
    targetCount: reservations.length,
    publishedCount: results.filter((result) => result.status === "posted").length,
    skippedCount: results.filter((result) => result.status === "skipped").length,
    errorCount: results.filter((result) => !result.ok && result.status !== "skipped").length,
    results
  };
}

export async function publishOneReservation(reservationId: string, { dryRun = true }: { dryRun?: boolean }): Promise<PublishActionResult> {
  const checkedAt = new Date().toISOString();
  const reservation = await loadReservation(reservationId);
  if (!reservation) {
    return { ok: false, mode: dryRun ? "dry_run" : "publish", reservationId, checkedAt, error: "Reservation was not found" };
  }
  return publishReservation(reservation, { dryRun, checkedAt });
}

async function publishReservation(reservation: Reservation, { dryRun, checkedAt }: { dryRun: boolean; checkedAt: string }): Promise<PublishActionResult> {
  const finalCheck = runFinalPublishCheck(reservation, new Date(checkedAt), MAX_RETRY_COUNT);
  const target = toTargetPreview(reservation, finalCheck);

  if (!finalCheck.canPublish) {
    if (!dryRun) {
      await insertPostLog(reservation, {
        action: "dry_run",
        status: "skipped",
        requestSummary: target,
        responseSummary: { blocking_reasons: finalCheck.blockingReasons }
      });
    }
    return {
      ok: true,
      mode: dryRun ? "dry_run" : "publish",
      reservationId: reservation.id,
      checkedAt,
      target,
      status: "skipped",
      error: finalCheck.blockingReasons[0] ?? "Final publish check did not pass"
    };
  }

  if (dryRun) {
    return { ok: true, mode: "dry_run", reservationId: reservation.id, checkedAt, target, status: "scheduled" };
  }

  try {
    const result = await publishThreadsPost({
      postType: reservation.postType,
      text: reservation.text,
      imageUrl: reservation.imageUrl,
      videoUrl: reservation.videoUrl
    });

    const postedAt = new Date().toISOString();
    const updateResult = await updateReservationAfterSuccess(reservation.id, result.threadsPostId, postedAt);
    if (!updateResult.ok) throw new Error(updateResult.error);

    await insertPostLog(reservation, {
      action: actionForType(reservation.postType),
      status: "posted",
      threadsPostId: result.threadsPostId,
      requestSummary: result.requestSummary,
      responseSummary: result.responseSummary
    });

    return {
      ok: true,
      mode: "publish",
      reservationId: reservation.id,
      checkedAt,
      target,
      threadsPostId: result.threadsPostId,
      status: "posted"
    };
  } catch (caught) {
    const error = normalizePublishError(caught);
    await updateReservationAfterFailure(reservation, error.message, error.errorType);
    await insertPostLog(reservation, {
      action: actionForType(reservation.postType),
      status: "error",
      errorMessage: error.message,
      requestSummary: { post_type: reservation.postType, text_length: reservation.text.length },
      responseSummary: { error_type: error.errorType }
    });
    await logPublishError("threads_publish", error.errorType, error.message, { reservation_id: reservation.id, status: error.status });

    return {
      ok: false,
      mode: "publish",
      reservationId: reservation.id,
      checkedAt,
      target,
      status: "error",
      error: error.message
    };
  }
}

async function loadReservation(reservationId: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("post_reservations")
    .select("*,post_ideas(genre,post_type,template_risk,human_score)")
    .eq("id", reservationId)
    .eq("user_id", DEFAULT_USER_ID)
    .maybeSingle();

  if (error) {
    await logPublishError("publish_one", "db_error", error.message, { reservation_id: reservationId });
    return null;
  }
  return data ? mapReservationRow(data as ReservationRow) : null;
}

async function updateReservationAfterSuccess(reservationId: string, threadsPostId: string, postedAt: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role configuration is missing" };

  const { error } = await supabase
    .from("post_reservations")
    .update({
      status: "posted",
      posted_at: postedAt,
      threads_post_id: threadsPostId,
      error_message: null,
      last_attempted_at: postedAt,
      last_error_type: null
    })
    .eq("id", reservationId)
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "scheduled")
    .is("threads_post_id", null);

  return error ? { ok: false, error: migrationMessage(error.message) } : { ok: true };
}

async function updateReservationAfterFailure(reservation: Reservation, message: string, errorType: string) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return;

  const attemptedAt = new Date().toISOString();
  const { error } = await supabase
    .from("post_reservations")
    .update({
      status: "error",
      error_message: message,
      retry_count: reservation.retryCount + 1,
      last_attempted_at: attemptedAt,
      last_error_type: errorType
    })
    .eq("id", reservation.id)
    .eq("user_id", DEFAULT_USER_ID)
    .eq("status", "scheduled")
    .is("threads_post_id", null);

  if (error) {
    await logPublishError("publish_failure_update", "db_error", error.message, { reservation_id: reservation.id });
  }
}

async function insertPostLog(
  reservation: Reservation,
  input: {
    action: string;
    status: string;
    threadsPostId?: string | null;
    requestSummary?: Record<string, unknown>;
    responseSummary?: Record<string, unknown>;
    errorMessage?: string | null;
  }
) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("post_logs").insert({
    user_id: DEFAULT_USER_ID,
    account_id: reservation.accountId,
    reservation_id: reservation.id,
    idea_id: reservation.ideaId,
    action: input.action,
    status: input.status,
    threads_post_id: input.threadsPostId ?? null,
    request_summary: sanitizeSummary(input.requestSummary ?? {}),
    response_summary: sanitizeSummary(input.responseSummary ?? {}),
    error_message: input.errorMessage ?? null,
    retry_count: reservation.retryCount,
    published_at: input.status === "posted" ? new Date().toISOString() : null
  });

  if (error) {
    await logPublishError("post_log_insert", "db_error", error.message, { reservation_id: reservation.id });
  }
}

function toTargetPreview(reservation: Reservation, finalCheck: PublishCheckResult): PublishTargetPreview {
  return {
    reservationId: reservation.id,
    scheduledAt: reservation.scheduledAt,
    postType: reservation.postType,
    text: reservation.text,
    imageUrl: reservation.imageUrl,
    videoUrl: reservation.videoUrl,
    threadGroupId: reservation.threadGroupId,
    threadOrder: reservation.threadOrder,
    finalCheck
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

function actionForType(postType: ReservationPostType) {
  if (postType === "IMAGE") return "publish_image";
  if (postType === "VIDEO") return "publish_video";
  if (postType === "THREAD") return "publish_thread";
  return "publish_text";
}

function normalizePublishError(caught: unknown) {
  if (caught instanceof ThreadsApiError) {
    return { errorType: caught.errorType, message: caught.message, status: caught.status };
  }
  if (caught instanceof Error) {
    return { errorType: "unknown", message: caught.message };
  }
  return { errorType: "unknown", message: "Unknown publish error" };
}

function sanitizeSummary(summary: Record<string, unknown>) {
  const blocked = ["token", "access_token", "secret", "key", "authorization"];
  return Object.fromEntries(Object.entries(summary).filter(([name]) => !blocked.some((blockedName) => name.toLowerCase().includes(blockedName))));
}

async function logPublishError(source: string, errorType: string, message: string, details: Record<string, unknown>) {
  await saveErrorLog({
    source,
    route: `services/publish-service:${source}`,
    errorType,
    message,
    details
  });
}

function emptyDueResult(dryRun: boolean, checkedAt: string, error: string): PublishDueResult {
  return {
    ok: false,
    mode: dryRun ? "dry_run" : "publish",
    checkedAt,
    targetCount: 0,
    publishedCount: 0,
    skippedCount: 0,
    errorCount: 1,
    results: [{ ok: false, mode: dryRun ? "dry_run" : "publish", checkedAt, error }]
  };
}

function migrationMessage(message: string) {
  return /column .* does not exist|schema cache|post_logs|retry_count|last_attempted_at|last_error_type/i.test(message)
    ? "Supabaseに Phase 5 後半用のカラムがまだありません。006_phase5_publish_execution.sql をSQL Editorで実行してください。"
    : message;
}
