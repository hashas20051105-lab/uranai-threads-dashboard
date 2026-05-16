import type { PrePublishCheckItem, PrePublishCheckStatus, PublishCheckResult, Reservation } from "@/types/domain";

const MAX_RETRY_COUNT = 3;
const STATUS_OK: PrePublishCheckStatus = "OK";
const STATUS_WARN = "WARNING" as PrePublishCheckStatus;
const STATUS_FIX = "NEEDS_FIX" as PrePublishCheckStatus;
const STATUS_BLOCKED = "BLOCKED" as PrePublishCheckStatus;

export function runFinalPublishCheck(reservation: Reservation, now = new Date(), maxRetryCount = MAX_RETRY_COUNT): PublishCheckResult {
  const items: PrePublishCheckItem[] = [];

  push(items, "status", "Reservation status", reservation.status === "scheduled" ? STATUS_OK : STATUS_BLOCKED, "Only status=scheduled can be published.");
  push(items, "human_approval", "Human approval", reservation.approvedByHuman ? STATUS_OK : STATUS_BLOCKED, "approved_by_human=true is required.");
  push(items, "scheduled_at", "Scheduled time", new Date(reservation.scheduledAt).getTime() <= now.getTime() ? STATUS_OK : STATUS_BLOCKED, "Only due reservations can be published.");
  push(items, "duplicate", "Duplicate prevention", reservation.threadsPostId ? STATUS_BLOCKED : STATUS_OK, "Reservations with threads_post_id are never published again.");
  push(items, "text", "Text", reservation.text.trim() ? STATUS_OK : STATUS_BLOCKED, "Text must not be empty.");
  push(items, "post_type", "Post type", ["TEXT", "IMAGE", "VIDEO", "THREAD"].includes(reservation.postType) ? STATUS_OK : STATUS_BLOCKED, "Supported types are TEXT, IMAGE, VIDEO, THREAD.");
  push(items, "image_url", "Image URL", mediaUrlStatus(reservation.imageUrl, reservation.postType === "IMAGE"), "IMAGE posts require a public image_url.");
  push(items, "video_url", "Video URL", mediaUrlStatus(reservation.videoUrl, reservation.postType === "VIDEO"), "VIDEO posts require a public video_url.");
  push(items, "template_risk", "Template risk", reservation.idea?.templateRisk === "blocked" ? STATUS_BLOCKED : reservation.idea?.templateRisk === "high" ? STATUS_FIX : STATUS_OK, `template_risk: ${reservation.idea?.templateRisk ?? "-"}`);
  push(items, "retry_count", "Retry count", reservation.retryCount < maxRetryCount ? STATUS_OK : STATUS_BLOCKED, `retry_count: ${reservation.retryCount} / ${maxRetryCount}`);
  push(items, "precheck", "Previous pre-publish check", precheckStatus(reservation), precheckMessage(reservation));

  const blockingReasons = items.filter((item) => item.status === STATUS_BLOCKED).map((item) => item.message);
  const overallStatus = deriveOverallStatus(items);

  return {
    overallStatus,
    canReserve: blockingReasons.length === 0,
    canPublish: blockingReasons.length === 0 && (overallStatus === STATUS_OK || overallStatus === STATUS_WARN),
    items,
    blockingReasons
  };
}

function push(items: PrePublishCheckItem[], key: string, label: string, status: PrePublishCheckStatus, message: string) {
  items.push({ key, label, status, message });
}

function deriveOverallStatus(items: PrePublishCheckItem[]): PrePublishCheckStatus {
  if (items.some((item) => item.status === STATUS_BLOCKED)) return STATUS_BLOCKED;
  if (items.some((item) => item.status === STATUS_FIX)) return STATUS_FIX;
  if (items.some((item) => item.status === STATUS_WARN)) return STATUS_WARN;
  return STATUS_OK;
}

function mediaUrlStatus(value: string | null, required: boolean): PrePublishCheckStatus {
  if (!value) return required ? STATUS_BLOCKED : STATUS_OK;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return STATUS_BLOCKED;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return STATUS_FIX;
    return STATUS_OK;
  } catch {
    return STATUS_BLOCKED;
  }
}

function precheckStatus(reservation: Reservation): PrePublishCheckStatus {
  const status = reservation.precheckResult?.overallStatus;
  if (!status) return STATUS_WARN;
  if (status === "OK") return STATUS_OK;
  const text = String(status);
  if (text.includes("不可") || text.toLowerCase().includes("blocked")) return STATUS_BLOCKED;
  if (text.includes("修正") || text.toLowerCase().includes("fix")) return STATUS_FIX;
  return STATUS_WARN;
}

function precheckMessage(reservation: Reservation) {
  return reservation.precheckResult?.overallStatus
    ? `Saved precheck status: ${reservation.precheckResult.overallStatus}`
    : "No saved precheck result. Publish is allowed with caution after all other final checks pass.";
}

