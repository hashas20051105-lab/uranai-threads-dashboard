"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdoptIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function adopt() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/ideas/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: ideaId, status: "adopted" })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "採用に失敗しました");
      }

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={adopt}
      disabled={isSaving}
      className="rounded bg-emerald-600 px-3 py-1 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSaving ? "保存中" : "採用"}
    </button>
  );
}
