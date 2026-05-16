import { TrendingUp } from "lucide-react";
import { recommendedGenres } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type RecommendedGenresProps = {
  genres: typeof recommendedGenres;
};

export function RecommendedGenres({ genres }: RecommendedGenresProps) {
  return (
    <SectionCard title="今日の狙い目ジャンル" description="固定ジャンルではなく、伸び方を想定したデモ表示です。">
      <div className="space-y-3">
        {genres.map((genre) => (
          <div key={genre.rank} className="rounded-md border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                  {genre.rank}
                </span>
                <p className="font-semibold text-slate-950">{genre.name}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {genre.score}
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-500">{genre.reason}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
