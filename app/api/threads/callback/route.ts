import { NextRequest, NextResponse } from "next/server";
import { exchangeThreadsCodeForToken } from "@/lib/threads/client";
import { saveErrorLog } from "@/services/error-log-service";

const STATE_COOKIE = "threads_oauth_state";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (error) {
    await saveErrorLog({
      source: "threads_oauth_callback",
      route: "app/api/threads/callback",
      errorType: "oauth_denied",
      message: errorDescription || error
    });
    return renderCallbackPage({
      ok: false,
      title: "Threads OAuth がキャンセルされました",
      message: errorDescription || error
    });
  }

  if (!code) {
    return renderCallbackPage({
      ok: false,
      title: "認証コードがありません",
      message: "Metaから code が返ってきませんでした。リダイレクトURL設定を確認してください。"
    });
  }

  if (!state || !expectedState || state !== expectedState) {
    await saveErrorLog({
      source: "threads_oauth_callback",
      route: "app/api/threads/callback",
      errorType: "invalid_state",
      message: "Threads OAuth state validation failed"
    });
    return renderCallbackPage({
      ok: false,
      title: "state検証に失敗しました",
      message: "認証を最初からやり直してください。"
    });
  }

  try {
    const tokenResult = await exchangeThreadsCodeForToken(code);
    const response = renderCallbackPage({
      ok: true,
      title: "Threads OAuth 認証に成功しました",
      message: "長期アクセストークンを取得しました。下のトークンをVercelの THREADS_ACCESS_TOKEN に設定してください。",
      token: tokenResult.longLivedAccessToken,
      summary: tokenResult.longLived
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Threads OAuth token exchange failed";
    await saveErrorLog({
      source: "threads_oauth_callback",
      route: "app/api/threads/callback",
      errorType: "token_exchange_failed",
      message
    });
    return renderCallbackPage({
      ok: false,
      title: "トークン取得に失敗しました",
      message
    });
  }
}

export async function POST() {
  return NextResponse.json({ ok: true, status: "ready", endpoint: "threads_callback" });
}

function renderCallbackPage(input: { ok: boolean; title: string; message: string; token?: string; summary?: unknown }) {
  const tokenBlock = input.token
    ? `<div class="token"><p>THREADS_ACCESS_TOKEN</p><textarea readonly>${escapeHtml(input.token)}</textarea></div>`
    : "";
  const summaryBlock = input.summary
    ? `<pre>${escapeHtml(JSON.stringify(input.summary, null, 2))}</pre>`
    : "";

  return new NextResponse(
    `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
      main { max-width: 820px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 16px 40px rgba(15,23,42,.08); }
      .badge { display: inline-block; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; background: ${input.ok ? "#dcfce7" : "#fee2e2"}; color: ${input.ok ? "#166534" : "#991b1b"}; }
      h1 { font-size: 24px; margin: 18px 0 8px; }
      p { line-height: 1.7; }
      textarea { width: 100%; min-height: 140px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; }
      pre { overflow: auto; border-radius: 8px; background: #f1f5f9; padding: 12px; }
      a { color: #6d28d9; font-weight: 700; }
      .token { margin-top: 22px; }
    </style>
  </head>
  <body>
    <main>
      <span class="badge">${input.ok ? "成功" : "要確認"}</span>
      <h1>${escapeHtml(input.title)}</h1>
      <p>${escapeHtml(input.message)}</p>
      ${tokenBlock}
      ${summaryBlock}
      <p><a href="/settings">設定画面へ戻る</a></p>
    </main>
  </body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    }
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
