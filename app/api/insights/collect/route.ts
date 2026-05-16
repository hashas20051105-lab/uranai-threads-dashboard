import { NextResponse } from "next/server";
import { collectPostedInsights } from "@/services/insight-service";

export async function POST(request: Request) {
  if (!isAllowed(request)) {
    return NextResponse.json({ ok: false, error: "Insight collection is protected. Use CRON_SECRET outside local development." }, { status: 401 });
  }
  const result = await collectPostedInsights();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

function isAllowed(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-cron-secret");
  if (secret && (authorization === secret || headerSecret === secret)) return true;
  const host = request.headers.get("host") ?? "";
  return process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}

