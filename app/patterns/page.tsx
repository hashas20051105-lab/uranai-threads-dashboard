import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, TextAreaField, valueText } from "@/components/master/master-page-shell";
import { createPattern, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addPattern(formData: FormData) {
  "use server";
  await createPattern(formData);
  revalidatePath("/patterns");
}

export default async function PatternsPage() {
  const rows = await listMasterRows("pattern_db");

  return (
    <MasterPageShell title="型DB" description="伸びた投稿の型を蓄積し、投稿案生成や分析に使います。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="型を追加">
          <form action={addPattern} className="grid gap-3">
            <Field label="型名" name="pattern_name" placeholder="例: 共感型" required />
            <TextAreaField label="説明" name="description" placeholder="読者の感情に寄り添う構成" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="型一覧">
          <DataTable
            headers={["型名", "説明", "平均スコア", "使用回数"]}
            rows={rows.map((row) => [valueText(row.pattern_name), valueText(row.description), valueText(row.average_score), valueText(row.usage_count)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
