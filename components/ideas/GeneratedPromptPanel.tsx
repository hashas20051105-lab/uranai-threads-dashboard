"use client";

type GeneratedPromptPanelProps = {
  prompt: string;
  openaiConfigured: boolean | null;
};

export function GeneratedPromptPanel({ prompt, openaiConfigured }: GeneratedPromptPanelProps) {
  if (!prompt) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">ChatGPT貼り付け用プロンプト</h2>
          <p className="mt-1 text-xs text-slate-500">
            OpenAI APIキー{openaiConfigured ? "あり。サーバー側呼び出しも試行します。" : "なし。必要ならこのプロンプトを使えます。"}
          </p>
        </div>
      </div>
      <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {prompt}
      </pre>
    </section>
  );
}
