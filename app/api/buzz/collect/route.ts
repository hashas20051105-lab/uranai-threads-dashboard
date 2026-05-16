import { NextResponse } from "next/server";
import { collectPreviousDayBuzzPosts } from "@/services/threads-service";

export async function POST() {
  const result = await collectPreviousDayBuzzPosts();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
