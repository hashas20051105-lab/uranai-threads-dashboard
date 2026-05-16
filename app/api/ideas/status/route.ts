import { NextResponse } from "next/server";
import { adoptDashboardIdea } from "@/services/dashboard-service";

const allowedStatuses = new Set(["draft", "adopted", "needs_edit", "rejected", "reserved"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { idea_id?: string; status?: string } | null;
  const ideaId = body?.idea_id;
  const status = body?.status;

  if (!ideaId || !status || !allowedStatuses.has(status)) {
    return NextResponse.json({ ok: false, message: "Invalid idea_id or status." }, { status: 400 });
  }

  if (status !== "adopted") {
    return NextResponse.json({ ok: false, message: "Dashboard quick action only supports adopted status." }, { status: 400 });
  }

  const result = await adoptDashboardIdea(ideaId);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
