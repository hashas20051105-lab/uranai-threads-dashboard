import { IdeaGeneratorForm } from "@/components/ideas/IdeaGeneratorForm";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Phase 2</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">投稿案生成</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          日常素材とブランド人格をもとに、占いThreads向けの投稿案を30本生成します。
          Threads API連携や実投稿はまだ行いません。
        </p>
      </section>

      <IdeaGeneratorForm />
    </div>
  );
}
