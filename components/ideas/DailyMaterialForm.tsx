"use client";

import type { DailyMaterialInput } from "@/types/domain";

type DailyMaterialFormProps = {
  value: DailyMaterialInput;
  onChange: (value: DailyMaterialInput) => void;
};

const fields: Array<{ key: keyof DailyMaterialInput; label: string; placeholder: string }> = [
  { key: "happened", label: "今日あったこと", placeholder: "例: 朝の予定が少し変わった" },
  { key: "weather", label: "今日の天気", placeholder: "例: 薄い曇り、湿度が高い" },
  { key: "mood", label: "今日の気分", placeholder: "例: 落ち着いている" },
  { key: "recentFeeling", label: "最近感じたこと", placeholder: "例: 急がず整えたい" },
  { key: "messageToReader", label: "読者に伝えたいこと", placeholder: "例: 自分のペースを取り戻してほしい" },
  { key: "operatorNote", label: "運用者のひとこと", placeholder: "例: 今日は短めに伝える" },
  { key: "atmosphere", label: "今日の空気感", placeholder: "例: 静かで少し湿度のある空気" },
  { key: "smallRealization", label: "最近の小さな気づき", placeholder: "例: 焦るほど視野が狭くなる" },
  { key: "personalExperience", label: "投稿に混ぜたい実体験", placeholder: "例: 手帳に3行だけ書いたら軽くなった" }
];

export function DailyMaterialForm({ value, onChange }: DailyMaterialFormProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">日常素材入力</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          一部の投稿案に自然に混ぜます。空欄でもデモ生成はできます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <label key={field.key} className="space-y-2">
            <span className="text-xs font-semibold text-slate-600">{field.label}</span>
            <textarea
              value={value[field.key]}
              onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
              placeholder={field.placeholder}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
