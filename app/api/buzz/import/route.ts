import { NextResponse } from "next/server";
import { importBuzzPosts } from "@/services/buzz-service";
import type { BuzzDataSource, BuzzImportInput } from "@/types/domain";

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string): Array<Partial<BuzzImportInput>> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "manual" | "csv";
      dataSource?: BuzzDataSource;
      post?: Partial<BuzzImportInput>;
      csvText?: string;
    };

    const mode = body.mode === "csv" ? "csv" : "manual";
    const inputs = mode === "csv" ? parseCsv(body.csvText ?? "") : [body.post ?? {}];

    const result = await importBuzzPosts(inputs, mode);
    const status = result.savedCount > 0 ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      {
        savedCount: 0,
        failedCount: 1,
        posts: [],
        errors: ["バズ投稿の取り込みに失敗しました。入力内容とSupabase設定を確認してください。"]
      },
      { status: 500 }
    );
  }
}
