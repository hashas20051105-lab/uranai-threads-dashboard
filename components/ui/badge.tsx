import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "gold" | "blue" | "green" | "rose" | "sage" | "neutral";

const toneMap: Record<BadgeTone, string> = {
  gold: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  sage: "bg-green-50 text-green-700 border-green-200",
  neutral: "bg-stone-50 text-stone-600 border-stone-200"
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        toneMap[tone],
        className
      )}
      {...props}
    />
  );
}
