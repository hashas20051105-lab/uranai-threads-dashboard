import { NextResponse } from "next/server";
import { cancelReservation } from "@/services/reservation-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { reservation_id?: string };

  if (!body.reservation_id) {
    return NextResponse.json({ ok: false, error: "予約IDがありません。" }, { status: 400 });
  }

  const result = await cancelReservation(body.reservation_id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
