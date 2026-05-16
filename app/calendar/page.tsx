import { revalidatePath } from "next/cache";
import { DataTable, Field, MasterCard, MasterPageShell, SubmitButton, TextAreaField, valueText } from "@/components/master/master-page-shell";
import { createFortuneCalendarEvent, listMasterRows } from "@/services/master-data-service";

export const dynamic = "force-dynamic";

async function addEvent(formData: FormData) {
  "use server";
  await createFortuneCalendarEvent(formData);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export default async function CalendarPage() {
  const rows = await listMasterRows("fortune_calendar", "date", true);

  return (
    <MasterPageShell title="占いカレンダー" description="新月・満月・開運日・季節イベントを登録し、投稿案生成とダッシュボードに反映します。">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MasterCard title="イベント追加">
          <form action={addEvent} className="grid gap-3">
            <Field label="日付" name="date" type="date" required />
            <Field label="イベント名" name="event_name" placeholder="例: 新月" required />
            <Field label="種別" name="event_type" placeholder="例: 月相" />
            <Field label="関連ジャンル" name="related_genre" placeholder="例: 開運" />
            <Field label="重要度" name="importance_score" type="number" placeholder="80" />
            <TextAreaField label="おすすめ投稿角度" name="suggested_angle" />
            <TextAreaField label="避ける表現" name="ng_angle" />
            <SubmitButton />
          </form>
        </MasterCard>
        <MasterCard title="イベント一覧">
          <DataTable
            headers={["日付", "イベント", "種別", "ジャンル", "重要度", "投稿角度", "避ける表現"]}
            rows={rows.map((row) => [valueText(row.date), valueText(row.event_name), valueText(row.event_type), valueText(row.related_genre), valueText(row.importance_score), valueText(row.suggested_angle), valueText(row.ng_angle)])}
          />
        </MasterCard>
      </div>
    </MasterPageShell>
  );
}
