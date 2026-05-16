import type { BuzzImportInput } from "@/types/domain";

export type NormalizedThreadsPost = BuzzImportInput & {
  post_id?: string;
  keyword: string;
  media_type?: string;
};

export function normalizeThreadsSearchResponse(payload: unknown, keyword: string): NormalizedThreadsPost[] {
  const items = extractItems(payload);
  return items
    .map((item) => normalizeItem(item, keyword))
    .filter((item): item is NormalizedThreadsPost => Boolean(item?.post_text));
}

function extractItems(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.posts)) return record.posts;
  if (Array.isArray(record.results)) return record.results;
  return [];
}

function normalizeItem(item: unknown, keyword: string): NormalizedThreadsPost | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, any>;
  const user = record.user ?? record.author ?? record.owner ?? {};

  return {
    post_id: stringOrUndefined(record.id ?? record.post_id ?? record.pk),
    post_url: stringOrUndefined(record.permalink ?? record.post_url ?? record.url ?? record.link),
    author_username: stringOrUndefined(record.username ?? record.author_username ?? user.username ?? user.handle),
    post_text: stringOrUndefined(record.text ?? record.caption ?? record.body ?? record.message) ?? "",
    posted_at: stringOrUndefined(record.timestamp ?? record.created_time ?? record.created_at ?? record.taken_at),
    like_count: numberOrZero(record.like_count ?? record.likes ?? record.likeCount),
    reply_count: numberOrZero(record.reply_count ?? record.replies ?? record.comment_count ?? record.comments),
    repost_count: numberOrZero(record.repost_count ?? record.reposts ?? record.reshare_count),
    quote_count: numberOrZero(record.quote_count ?? record.quotes),
    view_count: numberOrZero(record.view_count ?? record.views),
    memo: "Threads API keyword_search",
    keyword,
    media_type: stringOrUndefined(record.media_type ?? record.type)
  };
}

function stringOrUndefined(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function numberOrZero(value: unknown) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
