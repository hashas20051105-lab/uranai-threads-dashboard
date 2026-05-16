import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: string;
  className?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        {action ? (
          <span className="shrink-0 rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            {action}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
