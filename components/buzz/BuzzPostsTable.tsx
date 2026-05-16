"use client";

import { useMemo, useState } from "react";
import type { BuzzPost } from "@/types/domain";
import { BuzzFilters, type BuzzFilterState } from "@/components/buzz/BuzzFilters";
import { BuzzScoreBadge } from "@/components/buzz/BuzzScoreBadge";

const initialFilters: BuzzFilterState = {
  keyword: "",
  genre: "",
  patternType: "",
  postType: "",
  dataConfidence: "",
  sortKey: "buzz_score"
};

export function BuzzPostsTable({ posts }: { posts: BuzzPost[] }) {
  const [filters, setFilters] = useState(initialFilters);
  const filteredPosts = useMemo(() => applyFilters(posts, filters), [posts, filters]);

  return (
    <div className="space-y-4">
      <BuzzFilters posts={posts} value={filters} onChange={setFilters} />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">バズ投稿一覧</h2>
            <p className="text-sm text-slate-500">表示 {filteredPosts.length}件 / 保存 {posts.length}件</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-semibold text-slate-500">
                <th className="py-3">スコア</th>
                <th className="min-w-[220px] py-3">フック</th>
                <th className="min-w-[320px] py-3">本文</th>
                <th className="py-3">投稿者</th>
                <th className="py-3">ジャンル</th>
                <th className="py-3">型</th>
                <th className="py-3">投稿タイプ</th>
                <th className="py-3 text-right">like</th>
                <th className="py-3 text-right">reply</th>
                <th className="py-3 text-right">repost</th>
                <th className="py-3 text-right">quote</th>
                <th className="py-3 text-right">view</th>
                <th className="py-3">source</th>
                <th className="py-3">confidence</th>
                <th className="py-3">missing</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className="py-3"><BuzzScoreBadge score={post.buzzScore} /></td>
                  <td className="py-3 font-semibold text-slate-900">{post.hookText ?? "-"}</td>
                  <td className="py-3 text-slate-600"><p className="line-clamp-3">{post.postText}</p></td>
                  <td className="py-3 text-slate-600">{post.authorUsername ?? "-"}</td>
                  <td className="py-3"><Pill>{post.detectedGenre}</Pill></td>
                  <td className="py-3 text-slate-600">{post.patternType}</td>
                  <td className="py-3 text-slate-600">{post.postType}</td>
                  <td className="py-3 text-right">{post.likeCount.toLocaleString()}</td>
                  <td className="py-3 text-right">{post.replyCount.toLocaleString()}</td>
                  <td className="py-3 text-right">{post.repostCount.toLocaleString()}</td>
                  <td className="py-3 text-right">{post.quoteCount.toLocaleString()}</td>
                  <td className="py-3 text-right">{post.viewCount.toLocaleString()}</td>
                  <td className="py-3">{post.dataSource}</td>
                  <td className="py-3">{post.dataConfidence}</td>
                  <td className="py-3 text-xs text-slate-500">{post.missingFields.length ? post.missingFields.join(", ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{children}</span>;
}

function applyFilters(posts: BuzzPost[], filters: BuzzFilterState) {
  const keyword = filters.keyword.trim().toLowerCase();
  return posts
    .filter((post) => {
      if (keyword && !`${post.postText} ${post.hookText ?? ""} ${post.authorUsername ?? ""}`.toLowerCase().includes(keyword)) return false;
      if (filters.genre && post.detectedGenre !== filters.genre) return false;
      if (filters.patternType && post.patternType !== filters.patternType) return false;
      if (filters.postType && post.postType !== filters.postType) return false;
      if (filters.dataConfidence && post.dataConfidence !== filters.dataConfidence) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortKey === "posted_at") return new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime();
      if (filters.sortKey === "engagement_total") return b.engagementTotal - a.engagementTotal;
      return b.buzzScore - a.buzzScore;
    });
}
