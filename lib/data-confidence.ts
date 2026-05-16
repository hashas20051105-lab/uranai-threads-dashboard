export type DataConfidence = "high" | "medium" | "low";

const requiredFields = ["post_text", "posted_at", "like_count", "reply_count", "repost_count", "quote_count", "view_count"] as const;

export type ConfidenceInput = Partial<Record<(typeof requiredFields)[number], unknown>>;

export function getMissingFields(input: ConfidenceInput) {
  return requiredFields.filter((field) => {
    const value = input[field];
    return value === undefined || value === null || value === "";
  });
}

export function judgeDataConfidence(input: ConfidenceInput): { level: DataConfidence; score: number; missingFields: string[] } {
  const missingFields = getMissingFields(input);
  const hasText = !missingFields.includes("post_text");
  const reactionFields = ["like_count", "reply_count", "repost_count", "quote_count", "view_count"];
  const missingReactionCount = missingFields.filter((field) => reactionFields.includes(field)).length;

  if (missingFields.length === 0) return { level: "high", score: 0.92, missingFields };
  if (!hasText || missingReactionCount >= 4) return { level: "low", score: 0.32, missingFields };
  return { level: "medium", score: 0.62, missingFields };
}
