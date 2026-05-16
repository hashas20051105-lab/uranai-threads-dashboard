import { NextResponse } from "next/server";
import { collectPreviousDayBuzzPosts } from "@/services/threads-service";

export async function POST() {
  try {
    const result = await collectPreviousDayBuzzPosts();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Threads API収集中に予期しないエラーが発生しました。";
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checkedAt: new Date().toISOString(),
        since: new Date().toISOString(),
        until: new Date().toISOString(),
        keywordCount: 0,
        fetchedCount: 0,
        savedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        lastError: message,
        fallbackMessage: "手動インポートまたはCSVインポートで分析を継続できます。"
      },
      { status: 500 }
    );
  }
}
