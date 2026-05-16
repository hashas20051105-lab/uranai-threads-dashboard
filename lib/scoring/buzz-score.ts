export type BuzzScoreInput = {
  likeCount?: number | null;
  replyCount?: number | null;
  repostCount?: number | null;
  quoteCount?: number | null;
  viewCount?: number | null;
  postedAt?: string | null;
};

export function calculateElapsedHours(postedAt?: string | null, now = new Date()) {
  if (!postedAt) return 0;
  const postedDate = new Date(postedAt);
  if (Number.isNaN(postedDate.getTime())) return 0;
  return Math.max(0, (now.getTime() - postedDate.getTime()) / 1000 / 60 / 60);
}

export function calculateRecencyBonus(postedAt?: string | null, now = new Date()) {
  const elapsedHours = calculateElapsedHours(postedAt, now);
  if (!postedAt || elapsedHours <= 0) return 0;
  if (elapsedHours <= 6) return 30;
  if (elapsedHours <= 12) return 20;
  if (elapsedHours <= 24) return 10;
  if (elapsedHours <= 48) return 5;
  return 0;
}

export function calculateEngagementTotal(input: BuzzScoreInput) {
  return (input.likeCount ?? 0) + (input.replyCount ?? 0) + (input.repostCount ?? 0) + (input.quoteCount ?? 0);
}

export function calculateBuzzScore(input: BuzzScoreInput, now = new Date()) {
  return (
    (input.likeCount ?? 0) * 1 +
    (input.replyCount ?? 0) * 3 +
    (input.repostCount ?? 0) * 4 +
    (input.quoteCount ?? 0) * 4 +
    (input.viewCount ?? 0) * 0.02 +
    calculateRecencyBonus(input.postedAt, now)
  );
}
