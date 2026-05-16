import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, TextAreaField, valueText } from "@/components/master/master-page-shell";
import { createBrandPersona, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addBrandPersona(formData: FormData) {
  "use server";
  await createBrandPersona(formData);
  revalidatePath("/brand");
  revalidatePath("/dashboard");
}

export default async function BrandPage() {
  const rows = await listMasterRows("brand_personas");

  return (
    <MasterPageShell title="ブランド設定" description="投稿案生成とダッシュボードが参照する口調・世界観・NG表現を管理します。">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MasterCard title="ブランド人格を追加">
          <form action={addBrandPersona} className="grid gap-3">
            <Field label="ブランド名" name="brand_name" placeholder="例: 占いThreads編集長" required />
            <Field label="人格名" name="persona_name" placeholder="例: やさしい編集長" />
            <TextAreaField label="口調" name="tone" placeholder="断定しすぎず、落ち着いて寄り添う" />
            <TextAreaField label="世界観" name="worldview" placeholder="日常の小さな気づきと占いをつなげる" />
            <TextAreaField label="読者像" name="target_reader" placeholder="恋愛や日々の運気を自然に整えたい人" />
            <TextAreaField label="よく使う表現" name="common_phrases" placeholder="1行ずつ入力" />
            <TextAreaField label="NG表現" name="banned_phrases" placeholder="絶対 / 必ず / 100%" />
            <TextAreaField label="文章ルール" name="writing_rules" placeholder="1行ずつ入力" />
            <TextAreaField label="CTAスタイル" name="cta_style" placeholder="保存や見返しを控えめに促す" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="ブランド人格一覧">
          <DataTable
            headers={["ブランド", "人格", "口調", "世界観", "NG表現", "CTA"]}
            rows={rows.map((row) => [valueText(row.brand_name), valueText(row.persona_name), valueText(row.tone), valueText(row.worldview), valueText(row.banned_phrases), valueText(row.cta_style)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
