import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, valueText } from "@/components/master/master-page-shell";
import { createHook, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addHook(formData: FormData) {
  "use server";
  await createHook(formData);
  revalidatePath("/hooks");
}

export default async function HooksPage() {
  const rows = await listMasterRows("hook_db", "average_score");

  return (
    <MasterPageShell title="フックDB" description="伸びた冒頭フックを保存し、使い回しや成果傾向を確認します。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="フックを追加">
          <form action={addHook} className="grid gap-3">
            <Field label="フック文" name="hook_text" placeholder="例: 今日、心が軽くなるサイン" required />
            <Field label="フック種別" name="hook_type" placeholder="例: 共感型" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="フック一覧">
          <DataTable
            headers={["フック", "種別", "平均スコア", "使用回数", "前回使用"]}
            rows={rows.map((row) => [valueText(row.hook_text), valueText(row.hook_type), valueText(row.average_score), valueText(row.usage_count), valueText(row.last_used_at)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
