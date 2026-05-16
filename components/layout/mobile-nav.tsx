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
  { label: "ダッシュボード", href: "/dashboard", icon: Home, enabled: true },
  { label: "バズ調査", href: "/buzz", icon: Sparkles, enabled: true },
  { label: "キーワード", href: "/keywords", icon: KeyRound, enabled: false },
  { label: "投稿案", href: "/ideas", icon: Lightbulb, enabled: true },
  { label: "予約", href: "/reservations", icon: Clock, enabled: true },
  { label: "スケジュール", href: "/schedule", icon: CalendarDays, enabled: true },
  { label: "インサイト", href: "/insights", icon: BarChart3, enabled: true },
  { label: "型DB", href: "/patterns", icon: FileText, enabled: false },
  { label: "フックDB", href: "/hooks", icon: Wand2, enabled: false },
  { label: "画像DB", href: "/motifs", icon: Image, enabled: false },
  { label: "投稿タイプDB", href: "/post-types", icon: Tags, enabled: false },
  { label: "ブランド", href: "/brand", icon: ShieldCheck, enabled: false },
  { label: "カレンダー", href: "/calendar", icon: CalendarDays, enabled: false },
  { label: "CTA", href: "/cta", icon: MessageSquareText, enabled: false },
  { label: "実験", href: "/experiments", icon: FlaskConical, enabled: true },
  { label: "インポート", href: "/import", icon: FileText, enabled: true },
  { label: "レポート", href: "/reports", icon: FileText, enabled: true },
  { label: "設定", href: "/settings", icon: Settings, enabled: true }
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
          const className = cn(
            "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold",
            active && "border-violet-200 bg-violet-50 text-violet-800",
            !active && item.enabled && "bg-white text-slate-600",
            !item.enabled && "cursor-not-allowed bg-slate-50 text-slate-400"
          );

          if (!item.enabled) {
            return (
              <div key={item.href} className={className} aria-disabled="true">
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
