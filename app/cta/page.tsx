import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, valueText } from "@/components/master/master-page-shell";
import { createCta, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addCta(formData: FormData) {
  "use server";
  await createCta(formData);
  revalidatePath("/cta");
  revalidatePath("/dashboard");
}

export default async function CtaPage() {
  const rows = await listMasterRows("cta_db", "average_score");

  return (
    <MasterPageShell title="CTA管理" description="CTAの使用回数・平均スコア・リスクレベルを確認し、連続使用を避けます。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="CTA追加">
          <form action={addCta} className="grid gap-3">
            <Field label="CTA文" name="cta_text" placeholder="例: 気になる時に見返してください" required />
            <Field label="CTA種別" name="cta_type" placeholder="例: 保存促進" />
            <label className="block text-xs font-bold text-slate-600">
              リスクレベル
              <select name="risk_level" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-800">
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="CTA一覧">
          <DataTable
            headers={["CTA", "種別", "リスク", "使用回数", "平均スコア", "前回使用"]}
            rows={rows.map((row) => [valueText(row.cta_text), valueText(row.cta_type), valueText(row.risk_level), valueText(row.usage_count), valueText(row.average_score), valueText(row.last_used_at)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
