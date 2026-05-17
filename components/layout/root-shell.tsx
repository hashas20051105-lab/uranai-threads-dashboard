"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/app-review")
  ) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
