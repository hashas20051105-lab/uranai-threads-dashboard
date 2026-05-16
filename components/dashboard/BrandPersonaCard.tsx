import { brandPersona } from "@/lib/demo-data";
import { SectionCard } from "@/components/dashboard/SectionCard";

type BrandPersonaCardProps = {
  persona: typeof brandPersona;
};

export function BrandPersonaCard({ persona }: BrandPersonaCardProps) {
  return (
    <SectionCard title="ブランド人格" description="投稿案生成時に参照する口調とNG表現のデモです。">
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-slate-500">人格名</p>
          <p className="mt-1 font-semibold text-slate-950">{persona.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">口調</p>
          <p className="mt-1 leading-6 text-slate-700">{persona.tone}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">読者像</p>
          <p className="mt-1 leading-6 text-slate-700">{persona.reader}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">避ける表現</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {persona.banned.map((phrase) => (
              <span key={phrase} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
