import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, valueText } from "@/components/master/master-page-shell";
import { createImageMotif, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addMotif(formData: FormData) {
  "use server";
  await createImageMotif(formData);
  revalidatePath("/motifs");
}

export default async function MotifsPage() {
  const rows = await listMasterRows("image_motifs", "usage_count");

  return (
    <MasterPageShell title="画像モチーフDB" description="投稿画像で使うモチーフを管理し、使い回しを避けるために確認します。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="モチーフを追加">
          <form action={addMotif} className="grid gap-3">
            <Field label="モチーフ名" name="motif_name" placeholder="例: 月" required />
            <Field label="モチーフ種別" name="motif_type" placeholder="例: 天体" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="モチーフ一覧">
          <DataTable
            headers={["モチーフ", "種別", "使用回数", "平均スコア", "前回使用"]}
            rows={rows.map((row) => [valueText(row.motif_name), valueText(row.motif_type), valueText(row.usage_count), valueText(row.average_score), valueText(row.last_used_at)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
