import { NextResponse } from "next/server";
import { publishOneReservation } from "@/services/publish-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { reservation_id?: string; dry_run?: boolean };
  const dryRun = body.dry_run !== false;

  if (!body.reservation_id) {
    return NextResponse.json({ ok: false, error: "reservation_id is required" }, { status: 400 });
  }

  if (!dryRun && !isAllowedPublishRequest(request)) {
    return NextResponse.json({ ok: false, error: "Publish execution is protected. Use CRON_SECRET outside local development." }, { status: 401 });
  }

  const result = await publishOneReservation(body.reservation_id, { dryRun });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

function isAllowedPublishRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-cron-secret");
  if (secret && (authorization === secret || headerSecret === secret)) return true;

  const host = request.headers.get("host") ?? "";
  return process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}

