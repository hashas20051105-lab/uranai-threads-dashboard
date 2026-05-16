import { NextResponse } from "next/server";
import { generateIdeas } from "@/services/idea-service";
import type { DailyMaterialInput } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      dailyMaterial?: Partial<DailyMaterialInput>;
      forceDemo?: boolean;
    };
    const result = await generateIdeas({
      dailyMaterial: body.dailyMaterial,
      forceDemo: body.forceDemo
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "投稿案生成に失敗しました。入力内容とSupabase設定を確認してください。" }, { status: 500 });
  }
}
