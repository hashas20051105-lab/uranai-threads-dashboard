import type { ReservationPostType } from "@/types/domain";

export function PostPreview({
  text,
  postType,
  imageUrl,
  videoUrl
}: {
  text: string;
  postType: ReservationPostType;
  imageUrl?: string | null;
  videoUrl?: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-950">投稿本文プレビュー</p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{postType}</span>
      </div>
      <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-7 text-slate-800">{text || "本文を入力してください。"}</p>
      {imageUrl ? <p className="mt-3 truncate text-xs text-slate-500">画像URL: {imageUrl}</p> : null}
      {videoUrl ? <p className="mt-1 truncate text-xs text-slate-500">動画URL: {videoUrl}</p> : null}
    </div>
  );
}
