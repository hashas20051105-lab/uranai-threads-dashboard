import Link from "next/link";

export function PublicDocumentLayout({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <article className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">占いThreadsバズ司令塔</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">{children}</div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <Link className="font-bold text-violet-700" href="/">
            トップへ戻る
          </Link>
          <span className="mx-3">/</span>
          <Link className="font-bold text-violet-700" href="/privacy">
            Privacy Policy
          </Link>
          <span className="mx-3">/</span>
          <Link className="font-bold text-violet-700" href="/terms">
            Terms
          </Link>
        </div>
      </article>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
