import { DEFAULT_USER_ID } from "@/lib/constants";
import { getPreviousDayJstRange } from "@/lib/threads/date-range";
import { getThreadsEnvStatus, keywordSearch, testThreadsConnection, ThreadsApiError } from "@/lib/threads/client";
import { normalizeThreadsSearchResponse, type NormalizedThreadsPost } from "@/lib/threads/normalizer";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { buildBuzzInsertRow, insertBuzzRows } from "@/services/buzz-service";
import { saveErrorLog } from "@/services/error-log-service";
import type { ThreadsApiStatusResult, ThreadsCollectResult } from "@/types/domain";

export async function getThreadsApiStatus(): Promise<ThreadsApiStatusResult> {
  const env = getThreadsEnvStatus();
  return {
    ok: env.accessTokenConfigured && env.userIdConfigured,
    status: env.accessTokenConfigured && env.userIdConfigured ? "connected" : "not_configured",
    checkedAt: new Date().toISOString(),
    userIdConfigured: env.userIdConfigured,
    accessTokenConfigured: env.accessTokenConfigured,
    maskedUserId: env.maskedUserId,
    message: env.accessTokenConfigured && env.userIdConfigured ? undefined : "Threads API環境変数が未設定です。"
  };
}

export async function runThreadsConnectionTest(): Promise<ThreadsApiStatusResult> {
  const env = getThreadsEnvStatus();
  const base = {
    checkedAt: new Date().toISOString(),
    userIdConfigured: env.userIdConfigured,
    accessTokenConfigured: env.accessTokenConfigured,
    maskedUserId: env.maskedUserId
  };

  try {
    await testThreadsConnection();
    return { ...base, ok: true, status: "connected" };
  } catch (caught) {
    const error = normalizeThreadsError(caught);
    await saveErrorLog({
      source: "threads_test",
      route: "app/api/threads/test",
      errorType: error.errorType,
      message: error.message,
      details: { status: error.status }
    });
    return { ...base, ok: false, status: error.errorType === "missing_env" ? "not_configured" : "error", message: error.message };
  }
}

export async function collectPreviousDayBuzzPosts(): Promise<ThreadsCollectResult> {
  const { since, until } = getPreviousDayJstRange();
  const env = getThreadsEnvStatus();
  const checkedAt = new Date().toISOString();

  if (!env.accessTokenConfigured) {
    await saveErrorLog({
      source: "buzz_collect",
      route: "app/api/buzz/collect",
      errorType: "missing_env",
      message: "THREADS_ACCESS_TOKEN is missing"
    });
    return emptyCollectResult("not_configured", checkedAt, since, until, "THREADS_ACCESS_TOKEN is missing");
  }

  const keywords = await getEnabledKeywords();
  if (keywords.length === 0) {
    return {
      ...emptyCollectResult("fallback_required", checkedAt, since, until, "有効なキーワードがありません。"),
      keywordCount: 0
    };
  }

  let fetchedCount = 0;
  let errorCount = 0;
  let lastError: string | null = null;
  const normalizedPosts: NormalizedThreadsPost[] = [];

  for (const keyword of keywords) {
    try {
      const payload = await keywordSearch({ keyword, since, until, limit: 25 });
      const posts = normalizeThreadsSearchResponse(payload, keyword);
      fetchedCount += posts.length;
      normalizedPosts.push(...posts);
    } catch (caught) {
      const error = normalizeThreadsError(caught);
      errorCount += 1;
      lastError = error.message;
      await saveErrorLog({
        source: "threads_keyword_search",
        route: "app/api/buzz/collect",
        errorType: error.errorType,
        message: error.message,
        details: { keyword, status: error.status }
      });
    }
  }

  const uniquePosts = dedupeLocal(normalizedPosts);
  const { newPosts, skippedCount } = await excludeExistingPosts(uniquePosts);
  const rows = newPosts.map((post) =>
    buildBuzzInsertRow(post, "api", {
      threads_post_id: post.post_id ?? null,
      keyword: post.keyword,
      media_type: post.media_type ?? "text"
    })
  );
  const inserted = await insertBuzzRows(rows);
  const insertErrors = inserted.errors.length;

  return {
    ok: inserted.savedCount > 0 || (fetchedCount > 0 && errorCount === 0),
    status: errorCount > 0 && inserted.savedCount === 0 ? "fallback_required" : "collected",
    checkedAt,
    since,
    until,
    keywordCount: keywords.length,
    fetchedCount,
    savedCount: inserted.savedCount,
    skippedCount: skippedCount + inserted.failedCount,
    errorCount: errorCount + insertErrors,
    lastError: inserted.errors[0] ?? lastError,
    fallbackMessage:
      errorCount > 0 || insertErrors > 0
        ? "Threads API収集に失敗しました。手動インポートまたはCSVインポートで分析を継続できます。"
        : null
  };
}

async function getEnabledKeywords() {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) return [];

  const [keywordsResult, packsResult] = await Promise.all([
    supabase.from("keywords").select("keyword").eq("user_id", DEFAULT_USER_ID).eq("is_active", true),
    supabase.from("keyword_packs").select("keywords").eq("user_id", DEFAULT_USER_ID).eq("is_enabled", true)
  ]);

  const keywordValues = (keywordsResult.data ?? []).map((row) => row.keyword).filter(Boolean);
  const packValues = (packsResult.data ?? []).flatMap((row) => (Array.isArray(row.keywords) ? row.keywords : [])).map(String);
  return [...new Set([...keywordValues, ...packValues].map((keyword) => keyword.trim()).filter(Boolean))];
}

function dedupeLocal(posts: NormalizedThreadsPost[]) {
  const seen = new Set<string>();
  return posts.filter((post) => {
    const key = post.post_id || post.post_url || `${post.post_text}|${post.author_username ?? ""}|${post.posted_at ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function excludeExistingPosts(posts: NormalizedThreadsPost[]) {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase || posts.length === 0) return { newPosts: posts, skippedCount: 0 };

  let skippedCount = 0;
  const newPosts: NormalizedThreadsPost[] = [];

  for (const post of posts) {
    const query = supabase.from("buzz_posts").select("id").eq("user_id", DEFAULT_USER_ID).limit(1);
    let result;
    if (post.post_id) result = await query.eq("threads_post_id", post.post_id);
    else if (post.post_url) result = await query.eq("post_url", post.post_url);
    else {
      result = await query.eq("body", post.post_text).eq("author_handle", post.author_username ?? "").eq("posted_at", post.posted_at ?? "");
    }

    if (result.data && result.data.length > 0) skippedCount += 1;
    else newPosts.push(post);
  }

  return { newPosts, skippedCount };
}

function emptyCollectResult(status: ThreadsCollectResult["status"], checkedAt: string, since: string, until: string, lastError: string): ThreadsCollectResult {
  return {
    ok: false,
    status,
    checkedAt,
    since,
    until,
    keywordCount: 0,
    fetchedCount: 0,
    savedCount: 0,
    skippedCount: 0,
    errorCount: 1,
    lastError,
    fallbackMessage: "Threads API収集に失敗しました。手動インポートまたはCSVインポートで分析を継続できます。"
  };
}

function normalizeThreadsError(caught: unknown) {
  if (caught instanceof ThreadsApiError) {
    return { errorType: caught.errorType, message: caught.message, status: caught.status };
  }
  if (caught instanceof Error) {
    return { errorType: "network_error", message: caught.message };
  }
  return { errorType: "unknown", message: "Unknown Threads API error" };
}
