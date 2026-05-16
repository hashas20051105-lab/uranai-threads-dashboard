import { NextResponse } from "next/server";
import { generateDailyReport } from "@/services/report-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { report_date?: string };
  const result = await generateDailyReport(body.report_date);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

