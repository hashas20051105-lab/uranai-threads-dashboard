import { DEFAULT_USER_ID } from "@/lib/constants";
import { classifyGenre } from "@/lib/classifier/genre-classifier";
import { classifyPattern } from "@/lib/classifier/pattern-classifier";
import { classifyPostType } from "@/lib/classifier/post-type-classifier";
import { judgeDataConfidence } from "@/lib/data-confidence";
import { extractHook } from "@/lib/extractor/hook-extractor";
import { extractVisualMotifs } from "@/lib/extractor/motif-extractor";
import { calculateBuzzScore, calculateElapsedHours, calculateEngagementTotal, calculateRecencyBonus } from "@/lib/scoring/buzz-score";
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import type { BuzzDataSource, BuzzImportInput, BuzzImportResult, BuzzPost } from "@/types/domain";

type BuzzRow = Record<string, any>;

function toNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeInput(input: Partial<BuzzImportInput>): BuzzImportInput {
  return {
    post_url: input.post_url?.trim() || undefined,
    author_username: input.author_username?.trim() || undefined,
    post_text: input.post_text?.trim() || "",
    posted_at: input.posted_at || undefined,
    like_count: toNumber(input.like_count),
    reply_count: toNumber(input.reply_count),
    repost_count: toNumber(input.repost_count),
    quote_count: toNumber(input.quote_count),
    view_count: toNumber(input.view_count),
    memo: input.memo?.trim() || undefined
  };
}

export function buildBuzzInsertRow(input: BuzzImportInput, dataSource: BuzzDataSource, extras: Record<string, unknown> = {}) {
  const genre = classifyGenre(input.post_text);
  const patternType = classifyPattern(input.post_text);
  const postType = classifyPostType(input.post_text, genre);
  const hookText = extractHook(input.post_text);
  const visualMotifs = extractVisualMotifs(input.post_text);
  const recencyBonus = calculateRecencyBonus(input.posted_at);
  const elapsedHours = calculateElapsedHours(input.posted_at);
  const engagementTotal = calculateEngagementTotal({
    likeCount: input.like_count,
    replyCount: input.reply_count,
    repostCount: input.repost_count,
    quoteCount: input.quote_count,
    viewCount: input.view_count,
    postedAt: input.posted_at
  });
  const buzzScore = calculateBuzzScore({
    likeCount: input.like_count,
    replyCount: input.reply_count,
    repostCount: input.repost_count,
    quoteCount: input.quote_count,
    viewCount: input.view_count,
    postedAt: input.posted_at
  });
  const confidence = judgeDataConfidence({
    post_text: input.post_text,
    posted_at: input.posted_at,
    like_count: input.like_count,
    reply_count: input.reply_count,
    repost_count: input.repost_count,
    quote_count: input.quote_count,
    view_count: input.view_count
  });

  return {
    user_id: DEFAULT_USER_ID,
    source: dataSource,
    data_source: dataSource,
    post_url: input.post_url ?? null,
    author_handle: input.author_username ?? null,
    body: input.post_text,
    genre,
    detected_genre: genre,
    pattern_name: patternType,
    pattern_type: patternType,
    post_type: postType,
    hook_text: hookText,
    visual_motifs: visualMotifs,
    like_count: input.like_count ?? 0,
    reply_count: input.reply_count ?? 0,
    repost_count: input.repost_count ?? 0,
    quote_count: input.quote_count ?? 0,
    view_count: input.view_count ?? 0,
    engagement_total: engagementTotal,
    buzz_score: Number(buzzScore.toFixed(2)),
    recency_bonus: recencyBonus,
    elapsed_hours: Number(elapsedHours.toFixed(1)),
    data_confidence: confidence.score,
    data_confidence_level: confidence.level,
    missing_fields: confidence.missingFields,
    posted_at: input.posted_at || null,
    collected_date: new Date().toISOString().slice(0, 10),
    media_type: visualMotifs.length > 0 ? "image" : "text",
    ai_summary: hookText ? `${genre} / ${patternType} / ${postType}` : `${genre}として保存`,
    ai_reason: "Phase 3のルールベース分類で、本文キーワード・冒頭フック・反応数から自動補完しました。",
    memo: input.memo ?? null,
    ...extras
  };
}

function mapBuzzRow(row: BuzzRow): BuzzPost {
  return {
    id: row.id,
    postUrl: row.post_url ?? null,
    authorUsername: row.author_handle ?? null,
    postText: row.body ?? "",
    postedAt: row.posted_at ?? null,
    likeCount: row.like_count ?? 0,
    replyCount: row.reply_count ?? 0,
    repostCount: row.repost_count ?? 0,
    quoteCount: row.quote_count ?? 0,
    viewCount: row.view_count ?? 0,
    engagementTotal: row.engagement_total ?? row.like_count + row.reply_count + row.repost_count + row.quote_count,
    buzzScore: Number(row.buzz_score ?? 0),
    recencyBonus: Number(row.recency_bonus ?? 0),
    elapsedHours: Number(row.elapsed_hours ?? 0),
    detectedGenre: row.detected_genre ?? row.genre ?? "総合占い",
    patternType: row.pattern_type ?? row.pattern_name ?? "その他",
    postType: row.post_type ?? "占い結果型",
    hookText: row.hook_text ?? null,
    visualMotifs: Array.isArray(row.visual_motifs) ? row.visual_motifs : [],
    aiSummary: row.ai_summary ?? null,
    aiReason: row.ai_reason ?? null,
    dataSource: (row.data_source ?? row.source ?? "demo") as BuzzDataSource,
    dataConfidence: (row.data_confidence_level ?? "medium") as BuzzPost["dataConfidence"],
    missingFields: Array.isArray(row.missing_fields) ? row.missing_fields : [],
    memo: row.memo ?? null,
    createdAt: row.created_at
  };
}

export async function importBuzzPosts(inputs: Array<Partial<BuzzImportInput>>, dataSource: BuzzDataSource): Promise<BuzzImportResult> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return { savedCount: 0, failedCount: inputs.length, posts: [], errors: ["Supabaseのサーバー接続情報が未設定です。"] };
  }

  const rows = inputs.map(normalizeInput).filter((input) => input.post_text.length > 0).map((input) => buildBuzzInsertRow(input, dataSource));
  if (rows.length === 0) {
    return { savedCount: 0, failedCount: inputs.length, posts: [], errors: ["保存できる投稿本文がありません。"] };
  }

  const { data, error } = await supabase.from("buzz_posts").insert(rows).select("*");
  if (error) {
    const needsPhase3Migration = /column .* does not exist|schema cache/i.test(error.message);
    return {
      savedCount: 0,
      failedCount: rows.length,
      posts: [],
      errors: [
        needsPhase3Migration
          ? "SupabaseにPhase 3用カラムがまだありません。003_phase3_buzz_import.sql をSQL Editorで実行してください。"
          : error.message
      ]
    };
  }

  return { savedCount: data?.length ?? 0, failedCount: 0, posts: (data ?? []).map(mapBuzzRow), errors: [] };
}

export async function insertBuzzRows(rows: Array<Record<string, unknown>>): Promise<BuzzImportResult> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return { savedCount: 0, failedCount: rows.length, posts: [], errors: ["Supabaseのサーバー接続情報が未設定です。"] };
  }

  if (rows.length === 0) {
    return { savedCount: 0, failedCount: 0, posts: [], errors: [] };
  }

  const { data, error } = await supabase.from("buzz_posts").insert(rows).select("*");
  if (error) {
    const needsMigration = /column .* does not exist|schema cache/i.test(error.message);
    return {
      savedCount: 0,
      failedCount: rows.length,
      posts: [],
      errors: [
        needsMigration
          ? "SupabaseにPhase 3/4用カラムがまだありません。003_phase3_buzz_import.sql と 004_phase4_threads_reading.sql をSQL Editorで実行してください。"
          : error.message
      ]
    };
  }

  return { savedCount: data?.length ?? 0, failedCount: 0, posts: (data ?? []).map(mapBuzzRow), errors: [] };
}

export async function listBuzzPosts() {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("buzz_posts")
    .select("*")
    .eq("user_id", DEFAULT_USER_ID)
    .order("buzz_score", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map(mapBuzzRow);
}

export async function getDashboardBuzzData() {
  const posts = await listBuzzPosts();
  if (posts.length === 0) return null;

  const topPosts = posts.slice(0, 20).map((post, index) => ({
    rank: index + 1,
    hook: post.hookText ?? post.postText.slice(0, 40),
    author: post.authorUsername ?? "-",
    genre: post.detectedGenre,
    pattern: post.patternType,
    buzzScore: Math.round(post.buzzScore),
    likes: post.likeCount,
    replies: post.replyCount,
    reposts: post.repostCount,
    confidence: post.dataConfidence === "high" ? 0.9 : post.dataConfidence === "medium" ? 0.62 : 0.32
  }));

  const genreMap = new Map<string, { count: number; score: number }>();
  const hookMap = new Map<string, { count: number; score: number }>();
  const typeMap = new Map<string, number>();
  const motifMap = new Map<string, number>();

  posts.forEach((post) => {
    genreMap.set(post.detectedGenre, {
      count: (genreMap.get(post.detectedGenre)?.count ?? 0) + 1,
      score: (genreMap.get(post.detectedGenre)?.score ?? 0) + post.buzzScore
    });
    if (post.hookText) {
      hookMap.set(post.hookText, {
        count: (hookMap.get(post.hookText)?.count ?? 0) + 1,
        score: (hookMap.get(post.hookText)?.score ?? 0) + post.buzzScore
      });
    }
    typeMap.set(post.postType, (typeMap.get(post.postType) ?? 0) + 1);
    post.visualMotifs.forEach((motif) => motifMap.set(motif, (motifMap.get(motif) ?? 0) + 1));
  });

  const recommendedGenres = [...genreMap.entries()]
    .map(([name, value]) => ({ name, score: Math.round(value.score / value.count), count: value.count }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, name: item.name, score: item.score, reason: `${item.count}件の手動/CSVデータから算出` }));

  const hookRanking = [...hookMap.entries()]
    .map(([hook, value]) => ({ hook, uses: value.count, averageScore: Math.round(value.score / value.count) }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10)
    .map((item, index) => ({ rank: index + 1, ...item }));

  const totalTypes = Math.max(1, posts.length);
  const postTypeBalance = [...typeMap.entries()].map(([name, count]) => ({
    name,
    value: Math.round((count / totalTypes) * 100),
    target: 0
  }));

  const motifReuse = [...motifMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([motif, count]) => ({
      motif,
      count,
      risk: count >= 5 ? "高" : count >= 3 ? "中" : "低",
      lastUsed: "取込データ"
    }));

  return { topPosts, recommendedGenres, hookRanking, postTypeBalance, motifReuse };
}
