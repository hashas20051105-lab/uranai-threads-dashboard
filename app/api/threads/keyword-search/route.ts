import { NextResponse } from "next/server";
import { getPreviousDayJstRange } from "@/lib/threads/date-range";
import { keywordSearch, ThreadsApiError } from "@/lib/threads/client";
import { normalizeThreadsSearchResponse } from "@/lib/threads/normalizer";
import { saveErrorLog } from "@/services/error-log-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { keyword?: string };
    const keyword = body.keyword?.trim() || "占い";
    const { since, until } = getPreviousDayJstRange();
    const payload = await keywordSearch({ keyword, since, until, limit: 5 });
    const posts = normalizeThreadsSearchResponse(payload, keyword);

    return NextResponse.json({
      ok: true,
      keyword,
      since,
      until,
      fetchedCount: posts.length,
      samples: posts.slice(0, 3).map((post) => ({
        postId: post.post_id ?? null,
        postUrl: post.post_url ?? null,
        authorUsername: post.author_username ?? null,
        postedAt: post.posted_at ?? null,
        textPreview: post.post_text.slice(0, 80)
      }))
    });
  } catch (caught) {
    const error = normalizeError(caught);
    await saveErrorLog({
      source: "threads_keyword_search",
      route: "app/api/threads/keyword-search",
      errorType: error.errorType,
      message: error.message,
      details: { status: error.status }
    });

    return NextResponse.json(
      {
        ok: false,
        status: error.errorType === "missing_env" ? "not_configured" : "error",
        message: error.message,
        fallbackMessage: "Threads API収集に失敗しました。手動インポートまたはCSVインポートで分析を継続できます。"
      },
      { status: 400 }
    );
  }
}

function normalizeError(caught: unknown) {
  if (caught instanceof ThreadsApiError) {
    return { errorType: caught.errorType, message: caught.message, status: caught.status };
  }
  if (caught instanceof Error) {
    return { errorType: "network_error", message: caught.message };
  }
  return { errorType: "unknown", message: "Unknown Threads API error" };
}
