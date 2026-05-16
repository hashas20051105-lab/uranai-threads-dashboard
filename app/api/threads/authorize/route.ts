import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { buildThreadsAuthorizeUrl } from "@/lib/threads/client";
import { saveErrorLog } from "@/services/error-log-service";

const STATE_COOKIE = "threads_oauth_state";

export async function GET() {
  try {
    const state = randomBytes(24).toString("hex");
    const url = buildThreadsAuthorizeUrl(state);
    const response = NextResponse.redirect(url);
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Threads OAuth authorization failed";
    await saveErrorLog({
      source: "threads_oauth_authorize",
      route: "app/api/threads/authorize",
      errorType: "oauth_error",
      message
    });
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
