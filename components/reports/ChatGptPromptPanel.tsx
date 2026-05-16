export function ChatGptPromptPanel({ prompt }: { prompt: string | null }) {
  return (
    <div className="rounded-md border border-violet-100 bg-violet-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">ChatGPT prompt</p>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-700">{prompt || "プロンプトはまだありません。"}</pre>
    </div>
  );
}

