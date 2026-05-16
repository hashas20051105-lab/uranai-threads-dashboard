"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((result) => {
        if (result.authenticated) router.replace("/dashboard");
      })
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message ?? "ログインに失敗しました。");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-violet-600 text-white">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-violet-700">MVP Protected Mode</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{APP_NAME}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          管理画面と投稿APIを保護しています。公開前MVP用の単一パスワードでログインしてください。
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700" htmlFor="admin-password">
            管理パスワード
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none ring-violet-200 transition focus:border-violet-500 focus:ring-4"
            autoComplete="current-password"
            required
          />
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-violet-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "確認中..." : "ログイン"}
          </button>
        </form>
      </section>
    </main>
  );
}
