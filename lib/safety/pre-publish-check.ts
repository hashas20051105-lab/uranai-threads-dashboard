import { findRiskyExpressions } from "@/lib/safety/ng-words";
import { checkConsecutiveCta, extractCtaFromText } from "@/lib/safety/cta-rotation";
import { checkDailyPostLimit, checkPostInterval } from "@/lib/safety/post-interval";
import type {
  PrePublishCheckItem,
  PrePublishCheckResult,
  PrePublishCheckStatus,
  ReservationCandidateIdea,
  ReservationPostType
} from "@/types/domain";

type PrePublishInput = {
  idea: ReservationCandidateIdea;
  scheduledAt: string;
  reservationPostType: ReservationPostType;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  latestReservation?: {
    cta: string | null;
    genre: string | null;
    postType: string | null;
  } | null;
  existingScheduledTimes: string[];
};

const allowedDecisions = ["投稿推奨", "修正後投稿推奨"];

export function runPrePublishCheck(input: PrePublishInput): PrePublishCheckResult {
  const items: PrePublishCheckItem[] = [];
  const riskyWords = findRiskyExpressions(input.text);
  const cta = extractCtaFromText(input.text);
  const ctaCheck = checkConsecutiveCta(cta, input.latestReservation?.cta);
  const interval = checkPostInterval(input.scheduledAt, input.existingScheduledTimes);
  const dailyLimit = checkDailyPostLimit(input.scheduledAt, input.existingScheduledTimes);
  const imageUrl = validateOptionalUrl(input.imageUrl, input.reservationPostType === "IMAGE");
  const videoUrl = validateOptionalUrl(input.videoUrl, input.reservationPostType === "VIDEO");

  push(items, "idea_status", "投稿案ステータス", ["adopted", "needs_edit"].includes(input.idea.status) ? "OK" : "予約不可", "採用または修正後採用の投稿案だけ予約できます。");
  push(items, "publish_decision", "投稿判断", allowedDecisions.includes(input.idea.publishDecision) ? "OK" : "予約不可", `${allowedDecisions.join(" / ")} のみ予約できます。`);
  push(items, "ng_words", "NGワードチェック", riskyWords.length === 0 ? "OK" : "予約不可", riskyWords.length === 0 ? "強い断定・恐怖訴求は検出されませんでした。" : `注意表現: ${riskyWords.join("、")}`);
  push(items, "template_risk", "テンプレ危険度", ["high", "blocked"].includes(input.idea.templateRisk) ? "予約不可" : input.idea.templateRisk === "medium" ? "注意" : "OK", `現在の危険度: ${input.idea.templateRisk}`);
  push(items, "competitor_similarity", "競合類似度", input.idea.competitorSimilarityScore >= 80 ? "予約不可" : input.idea.competitorSimilarityScore >= 65 ? "注意" : "OK", `競合類似度: ${input.idea.competitorSimilarityScore}`);
  push(items, "cta_rotation", "CTA連続使用", ctaCheck.repeated ? "要修正" : "OK", ctaCheck.message);
  push(items, "post_interval", "最低投稿間隔", interval.ok ? "OK" : "予約不可", interval.message);
  push(items, "daily_limit", "本日の投稿上限", dailyLimit.ok ? "OK" : "予約不可", dailyLimit.message);
  push(items, "genre_rotation", "同一ジャンル連投", input.latestReservation?.genre === input.idea.genre ? "注意" : "OK", input.latestReservation?.genre === input.idea.genre ? "直近予約と同じジャンルです。" : "直近予約とジャンルが重複していません。");
  push(items, "post_type_rotation", "同一投稿タイプ連投", input.latestReservation?.postType === input.idea.postType ? "注意" : "OK", input.latestReservation?.postType === input.idea.postType ? "直近予約と同じ投稿タイプです。" : "直近予約と投稿タイプが重複していません。");
  push(items, "brand_tone", "ブランド口調一致", input.idea.humanScore >= 70 ? "OK" : input.idea.humanScore >= 55 ? "注意" : "要修正", `人間味スコア: ${input.idea.humanScore}`);
  push(items, "image_url", "画像URL形式", imageUrl.status, imageUrl.message);
  push(items, "video_url", "動画URL形式", videoUrl.status, videoUrl.message);

  const blockingReasons = items.filter((item) => item.status === "予約不可").map((item) => item.message);
  const overallStatus = deriveOverallStatus(items);

  return {
    overallStatus,
    canReserve: blockingReasons.length === 0,
    items,
    blockingReasons
  };
}

function push(items: PrePublishCheckItem[], key: string, label: string, status: PrePublishCheckStatus, message: string) {
  items.push({ key, label, status, message });
}

function deriveOverallStatus(items: PrePublishCheckItem[]): PrePublishCheckStatus {
  if (items.some((item) => item.status === "予約不可")) return "予約不可";
  if (items.some((item) => item.status === "要修正")) return "要修正";
  if (items.some((item) => item.status === "注意")) return "注意";
  return "OK";
}

function validateOptionalUrl(value: string | null | undefined, required: boolean): { status: PrePublishCheckStatus; message: string } {
  if (!value) {
    return required
      ? { status: "要修正", message: "この投稿タイプではURL入力を推奨します。" }
      : { status: "OK", message: "URL入力は任意です。" };
  }

  try {
    const url = new URL(value);
    const ok = ["http:", "https:"].includes(url.protocol);
    return ok ? { status: "OK", message: "URL形式は有効です。" } : { status: "要修正", message: "httpまたはhttpsのURLを入力してください。" };
  } catch {
    return { status: "要修正", message: "URL形式が正しくありません。" };
  }
}
