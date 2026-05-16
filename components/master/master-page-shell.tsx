import type { ReactNode } from "react";

export function MasterPageShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">MVP Master Data</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </section>
      {children}
    </div>
  );
}

export function MasterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({ label, name, type = "text", placeholder, required = false }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-600">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}

export function TextAreaField({ label, name, placeholder, rows = 3 }: { label: string; name: string; placeholder?: string; rows?: number }) {
  return (
    <label className="block text-xs font-bold text-slate-600">
      {label}
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}

export function SubmitButton({ children = "追加する" }: { children?: ReactNode }) {
  return (
    <button type="submit" className="rounded-md bg-violet-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-violet-800">
      {children}
    </button>
  );
}

export function EmptyRows({ message = "まだデータがありません。" }: { message?: string }) {
  return <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">{message}</div>;
}

export function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  if (rows.length === 0) return <EmptyRows />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-2 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-[340px] px-3 py-3 align-top font-medium text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function valueText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) return value.join(" / ") || fallback;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
