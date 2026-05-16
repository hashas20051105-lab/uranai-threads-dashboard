"use client";

import type { BuzzPost } from "@/types/domain";

export type BuzzSortKey = "buzz_score" | "posted_at" | "engagement_total";

export type BuzzFilterState = {
  keyword: string;
  genre: string;
  patternType: string;
  postType: string;
  dataConfidence: string;
  sortKey: BuzzSortKey;
};

type Props = {
  posts: BuzzPost[];
  value: BuzzFilterState;
  onChange: (value: BuzzFilterState) => void;
};

export function BuzzFilters({ posts, value, onChange }: Props) {
  const genres = unique(posts.map((post) => post.detectedGenre));
  const patterns = unique(posts.map((post) => post.patternType));
  const postTypes = unique(posts.map((post) => post.postType));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value })}
          placeholder="キーワード"
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <Select label="ジャンル" value={value.genre} options={genres} onChange={(genre) => onChange({ ...value, genre })} />
        <Select label="型" value={value.patternType} options={patterns} onChange={(patternType) => onChange({ ...value, patternType })} />
        <Select label="投稿タイプ" value={value.postType} options={postTypes} onChange={(postType) => onChange({ ...value, postType })} />
        <Select label="信頼度" value={value.dataConfidence} options={["high", "medium", "low"]} onChange={(dataConfidence) => onChange({ ...value, dataConfidence })} />
        <select
          value={value.sortKey}
          onChange={(event) => onChange({ ...value, sortKey: event.target.value as BuzzSortKey })}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        >
          <option value="buzz_score">バズスコア順</option>
          <option value="posted_at">投稿日順</option>
          <option value="engagement_total">反応数順</option>
        </select>
      </div>
    </section>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
    >
      <option value="">{label}: すべて</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort();
}
