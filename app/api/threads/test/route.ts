import { NextResponse } from "next/server";
import { runThreadsConnectionTest } from "@/services/threads-service";

export async function POST() {
  const result = await runThreadsConnectionTest();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
