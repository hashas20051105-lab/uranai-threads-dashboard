import { NextRequest, NextResponse } from "next/server";
import { saveErrorLog } from "@/services/error-log-service";

export async function GET() {
  return NextResponse.json({ ok: true, status: "ready", endpoint: "threads_deauthorize" });
}

export async function POST(request: NextRequest) {
  await saveErrorLog({
    source: "threads_deauthorize",
    route: "app/api/threads/deauthorize",
    errorType: "deauthorize_notice",
    message: "Threads deauthorization callback received",
    details: await safeDetails(request)
  });
  return NextResponse.json({ ok: true });
}

async function safeDetails(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {};
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  return {
    user_id_present: Boolean(record.user_id),
    issued_at_present: Boolean(record.issued_at)
  };
}
