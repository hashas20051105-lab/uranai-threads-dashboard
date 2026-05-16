import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, valueText } from "@/components/master/master-page-shell";
import { createPostType, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addPostType(formData: FormData) {
  "use server";
  await createPostType(formData);
  revalidatePath("/post-types");
}

export default async function PostTypesPage() {
  const rows = await listMasterRows("post_type_db");

  return (
    <MasterPageShell title="投稿タイプDB" description="投稿タイプと目標比率を管理し、テンプレ乱発を避けるために使います。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="投稿タイプを追加">
          <form action={addPostType} className="grid gap-3">
            <Field label="投稿タイプ" name="post_type" placeholder="例: 日常つぶやき型" required />
            <Field label="カテゴリ" name="category" placeholder="例: 日常・共感系" />
            <Field label="目標比率" name="target_ratio" type="number" placeholder="20" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="投稿タイプ一覧">
          <DataTable
            headers={["投稿タイプ", "カテゴリ", "目標比率", "使用回数", "平均スコア"]}
            rows={rows.map((row) => [valueText(row.post_type), valueText(row.category), valueText(row.target_ratio), valueText(row.usage_count), valueText(row.average_score)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
