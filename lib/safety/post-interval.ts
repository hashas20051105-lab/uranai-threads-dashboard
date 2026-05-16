import { DEFAULT_DAILY_POST_LIMIT, DEFAULT_MIN_POST_INTERVAL_MINUTES } from "@/lib/constants";

export function checkPostInterval(scheduledAt: string, existingScheduledTimes: string[]) {
  const target = new Date(scheduledAt).getTime();
  const minDiffMinutes = existingScheduledTimes.reduce((min, value) => {
    const diff = Math.abs(target - new Date(value).getTime()) / 60000;
    return Math.min(min, diff);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(minDiffMinutes)) {
    return { ok: true, message: "同日の近接予約はありません。" };
  }

  return {
    ok: minDiffMinutes >= DEFAULT_MIN_POST_INTERVAL_MINUTES,
    message:
      minDiffMinutes >= DEFAULT_MIN_POST_INTERVAL_MINUTES
        ? `最低投稿間隔 ${DEFAULT_MIN_POST_INTERVAL_MINUTES}分 を満たしています。`
        : `最低投稿間隔 ${DEFAULT_MIN_POST_INTERVAL_MINUTES}分 を下回っています。`
  };
}

export function checkDailyPostLimit(scheduledAt: string, existingScheduledTimes: string[]) {
  const targetDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date(scheduledAt));
  const count = existingScheduledTimes.filter((value) => {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date(value));
    return date === targetDate;
  }).length;

  return {
    ok: count < DEFAULT_DAILY_POST_LIMIT,
    count,
    message:
      count < DEFAULT_DAILY_POST_LIMIT
        ? `本日の予約数は ${count}/${DEFAULT_DAILY_POST_LIMIT} 件です。`
        : `本日の投稿上限 ${DEFAULT_DAILY_POST_LIMIT} 件に達しています。`
  };
}
