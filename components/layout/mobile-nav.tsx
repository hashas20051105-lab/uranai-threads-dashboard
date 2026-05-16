"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  FlaskConical,
  Home,
  Image,
  KeyRound,
  Lightbulb,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "ダッシュボード", href: "/dashboard", icon: Home },
  { label: "バズ調査", href: "/buzz", icon: Sparkles },
  { label: "キーワード", href: "/keywords", icon: KeyRound },
  { label: "投稿案", href: "/ideas", icon: Lightbulb },
  { label: "予約", href: "/reservations", icon: Clock },
  { label: "スケジュール", href: "/schedule", icon: CalendarDays },
  { label: "インサイト", href: "/insights", icon: BarChart3 },
  { label: "型DB", href: "/patterns", icon: FileText },
  { label: "フックDB", href: "/hooks", icon: Wand2 },
  { label: "画像DB", href: "/motifs", icon: Image },
  { label: "投稿タイプ", href: "/post-types", icon: Tags },
  { label: "ブランド", href: "/brand", icon: ShieldCheck },
  { label: "カレンダー", href: "/calendar", icon: CalendarDays },
  { label: "CTA", href: "/cta", icon: MessageSquareText },
  { label: "実験", href: "/experiments", icon: FlaskConical },
  { label: "インポート", href: "/import", icon: FileText },
  { label: "レポート", href: "/reports", icon: FileText },
  { label: "設定", href: "/settings", icon: Settings }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
      <p className="mb-3 text-base font-bold text-slate-950">占いThreadsバズ司令塔</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold",
                active && "border-violet-200 bg-violet-50 text-violet-800",
                !active && "bg-white text-slate-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
