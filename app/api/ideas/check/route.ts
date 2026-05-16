import { NextResponse } from "next/server";
import { updateIdeaStatus } from "@/services/idea-service";
import type { PostStatus } from "@/types/domain";

const allowedStatuses: PostStatus[] = ["draft", "adopted", "needs_edit", "rejected", "reserved"];

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      ideaId?: string;
      status?: PostStatus;
      humanMemo?: string;
    };

    if (!body.ideaId || !body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "入力が正しくありません。" }, { status: 400 });
    }

    const result = await updateIdeaStatus({
      ideaId: body.ideaId,
      status: body.status,
      humanMemo: body.humanMemo
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "ステータス更新に失敗しました。" }, { status: 500 });
  }
}
