import { NextResponse } from "next/server";
import { collectOneInsight, saveManualInsight } from "@/services/insight-service";
import type { InsightMetricInput } from "@/types/domain";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    reservation_id?: string;
    threads_post_id?: string;
    manual_metrics?: InsightMetricInput;
  };

  if (!body.reservation_id && !body.threads_post_id) {
    return NextResponse.json({ ok: false, error: "reservation_id or threads_post_id is required" }, { status: 400 });
  }

  if (body.manual_metrics && body.reservation_id) {
    const result = await saveManualInsight({ reservationId: body.reservation_id, metrics: body.manual_metrics });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const result = await collectOneInsight({ reservationId: body.reservation_id, threadsPostId: body.threads_post_id });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

