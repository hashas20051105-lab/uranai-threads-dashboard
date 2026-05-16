import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, TextAreaField, valueText } from "@/components/master/master-page-shell";
import { createKeyword, createKeywordPack, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addKeyword(formData: FormData) {
  "use server";
  await createKeyword(formData);
  revalidatePath("/keywords");
}

async function addKeywordPack(formData: FormData) {
  "use server";
  await createKeywordPack(formData);
  revalidatePath("/keywords");
}

export default async function KeywordsPage() {
  const [keywords, packs] = await Promise.all([listMasterRows("keywords"), listMasterRows("keyword_packs")]);

  return (
    <MasterPageShell title="キーワード管理" description="Threads収集で使う占い全般キーワードとブランド別キーワードパックを管理します。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="キーワード追加">
          <form action={addKeyword} className="grid gap-3">
            <Field label="キーワード" name="keyword" placeholder="例: 今日の運勢" required />
            <Field label="カテゴリ" name="category" placeholder="例: 総合占い" />
            <Field label="優先度" name="priority" type="number" placeholder="50" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="キーワード一覧">
          <DataTable
            headers={["キーワード", "カテゴリ", "優先度", "有効", "作成日"]}
            rows={keywords.map((row) => [valueText(row.keyword), valueText(row.category), valueText(row.priority), row.is_active ? "ON" : "OFF", valueText(row.created_at)])}
          />
        </MasterCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="キーワードパック追加">
          <form action={addKeywordPack} className="grid gap-3">
            <Field label="パック名" name="pack_name" placeholder="例: 恋愛特化パック" required />
            <Field label="パック種別" name="pack_type" placeholder="例: love" />
            <TextAreaField label="キーワード" name="keywords" placeholder="1行またはカンマ区切りで入力" />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" name="is_enabled" /> 有効にする</label>
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="キーワードパック一覧">
          <DataTable
            headers={["パック名", "種別", "有効", "キーワード", "メモ"]}
            rows={packs.map((row) => [valueText(row.pack_name), valueText(row.pack_type), row.is_enabled ? "ON" : "OFF", valueText(row.keywords), valueText(row.memo)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
