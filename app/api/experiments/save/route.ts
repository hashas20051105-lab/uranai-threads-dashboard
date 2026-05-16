import { NextResponse } from "next/server";
import { createExperiment, updateExperiment } from "@/services/experiment-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = body.id ? await updateExperiment(body) : await createExperiment(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

