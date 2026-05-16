import { NextResponse } from "next/server";
import { createReservation, previewPrePublishCheck } from "@/services/reservation-service";
import type { ReservationInput } from "@/types/domain";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReservationInput & { preview_only?: boolean };
  const result = body.preview_only ? await previewPrePublishCheck(body) : await createReservation(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
