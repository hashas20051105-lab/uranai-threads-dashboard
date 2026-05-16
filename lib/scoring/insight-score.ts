export type InsightMetricInput = {
  viewCount?: number | null;
  likeCount?: number | null;
  replyCount?: number | null;
  repostCount?: number | null;
  quoteCount?: number | null;
};

export function calculateInsightEngagement(input: InsightMetricInput) {
  return (input.likeCount ?? 0) + (input.replyCount ?? 0) + (input.repostCount ?? 0) + (input.quoteCount ?? 0);
}

export function calculateInsightBuzzScore(input: InsightMetricInput) {
  return (
    (input.likeCount ?? 0) * 1 +
    (input.replyCount ?? 0) * 3 +
    (input.repostCount ?? 0) * 4 +
    (input.quoteCount ?? 0) * 4 +
    (input.viewCount ?? 0) * 0.02
  );
}

export function deriveInsightConfidence(input: InsightMetricInput) {
  const missing = getMissingInsightFields(input);
  if (missing.length === 0) return "high";
  if (missing.length <= 2 && typeof input.viewCount === "number") return "medium";
  return "low";
}

export function getMissingInsightFields(input: InsightMetricInput) {
  const fields: Array<keyof InsightMetricInput> = ["viewCount", "likeCount", "replyCount", "repostCount", "quoteCount"];
  return fields.filter((field) => input[field] === null || input[field] === undefined).map(snakeCase);
}

export function nearestInsightHour(hoursAfterPost: number) {
  const targets = [1, 3, 6, 24, 48];
  return targets.reduce((best, target) => (Math.abs(target - hoursAfterPost) < Math.abs(best - hoursAfterPost) ? target : best), targets[0]);
}

function snakeCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

