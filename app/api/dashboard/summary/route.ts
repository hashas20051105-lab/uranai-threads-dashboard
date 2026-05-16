import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
