import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 xl:ml-64 xl:px-9">
        <Header />
        {children}
      </main>
    </>
  );
}
