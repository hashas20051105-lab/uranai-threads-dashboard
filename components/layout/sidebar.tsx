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
  Hourglass,
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
  { label: "ダッシュボード", href: "/dashboard", icon: Home, enabled: true },
  { label: "バズ調査", href: "/buzz", icon: Sparkles, enabled: true },
  { label: "キーワード管理", href: "/keywords", icon: KeyRound, enabled: false },
  { label: "投稿案生成", href: "/ideas", icon: Lightbulb, enabled: true },
  { label: "投稿予約", href: "/reservations", icon: Clock, enabled: true },
  { label: "投稿スケジュール", href: "/schedule", icon: CalendarDays, enabled: true },
  { label: "インサイト分析", href: "/insights", icon: BarChart3, enabled: true },
  { label: "型DB", href: "/patterns", icon: FileText, enabled: false },
  { label: "フックDB", href: "/hooks", icon: Wand2, enabled: false },
  { label: "画像モチーフDB", href: "/motifs", icon: Image, enabled: false },
  { label: "投稿タイプDB", href: "/post-types", icon: Tags, enabled: false },
  { label: "ブランド設定", href: "/brand", icon: ShieldCheck, enabled: false },
  { label: "占いカレンダー", href: "/calendar", icon: CalendarDays, enabled: false },
  { label: "CTA管理", href: "/cta", icon: MessageSquareText, enabled: false },
  { label: "実験管理", href: "/experiments", icon: FlaskConical, enabled: true },
  { label: "手動インポート", href: "/import", icon: FileText, enabled: true },
  { label: "レポート", href: "/reports", icon: FileText, enabled: true },
  { label: "設定", href: "/settings", icon: Settings, enabled: true }
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
          const className = cn(
            "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-bold transition",
            active && "bg-violet-500/90 text-white shadow-sm",
            !active && item.enabled && "text-slate-200 hover:bg-white/10 hover:text-white",
            !item.enabled && "cursor-not-allowed text-slate-500"
          );

          if (!item.enabled) {
            return (
              <div key={item.href} className={className} aria-disabled="true">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                <Hourglass className="ml-auto h-3.5 w-3.5 text-slate-500" />
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
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
