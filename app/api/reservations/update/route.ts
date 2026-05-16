import { NextResponse } from "next/server";
import { clearReservationError, updateReservation } from "@/services/reservation-service";
import type { ReservationInput, ReservationStatus } from "@/types/domain";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReservationInput & {
    reservation_id?: string;
    status?: ReservationStatus;
    mode?: "clear_error";
  };

  if (!body.reservation_id) {
    return NextResponse.json({ ok: false, error: "reservation_id is required" }, { status: 400 });
  }

  if (body.mode === "clear_error") {
    const result = await clearReservationError(body.reservation_id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const result = await updateReservation({ ...body, reservation_id: body.reservation_id });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
