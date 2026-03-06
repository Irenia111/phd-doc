"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useApiKey } from "@/hooks/use-api-key";

const KEY_OPTIONAL_PATHS = new Set(["/", "/settings", "/convert"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useApiKey();
  const [mobileOpen, setMobileOpen] = useState(false);
  const needsKey = useMemo(() => !KEY_OPTIONAL_PATHS.has(pathname), [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:block sticky top-0 h-screen shrink-0 z-10" />
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <Sidebar className="h-full" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        {status !== "configured" && needsKey ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-700">
            当前页面需要 API Key。请先前往设置页完成配置。
          </div>
        ) : null}
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
