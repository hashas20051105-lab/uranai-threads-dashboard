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
  { label: "キーワード管理", href: "/keywords", icon: KeyRound },
  { label: "投稿案生成", href: "/ideas", icon: Lightbulb },
  { label: "投稿予約", href: "/reservations", icon: Clock },
  { label: "投稿スケジュール", href: "/schedule", icon: CalendarDays },
  { label: "インサイト分析", href: "/insights", icon: BarChart3 },
  { label: "型DB", href: "/patterns", icon: FileText },
  { label: "フックDB", href: "/hooks", icon: Wand2 },
  { label: "画像モチーフDB", href: "/motifs", icon: Image },
  { label: "投稿タイプDB", href: "/post-types", icon: Tags },
  { label: "ブランド設定", href: "/brand", icon: ShieldCheck },
  { label: "占いカレンダー", href: "/calendar", icon: CalendarDays },
  { label: "CTA管理", href: "/cta", icon: MessageSquareText },
  { label: "実験管理", href: "/experiments", icon: FlaskConical },
  { label: "手動インポート", href: "/import", icon: FileText },
  { label: "レポート", href: "/reports", icon: FileText },
  { label: "設定", href: "/settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#02072b] text-white shadow-xl xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/70 bg-slate-950 text-amber-300">
          <Sparkles className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold leading-6">占い</p>
        <p className="text-lg font-bold leading-6">Threadsバズ司令塔</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-bold transition",
                active && "bg-violet-500/90 text-white shadow-sm",
                !active && "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5">
        <div className="rounded-lg bg-violet-600/30 p-4">
          <p className="text-sm font-bold text-amber-200">MVP Protected Mode</p>
          <p className="mt-2 text-xs leading-5 text-slate-200">簡易ログインで管理画面と投稿APIを保護中</p>
        </div>
      </div>
    </aside>
  );
}
