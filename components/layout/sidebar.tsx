"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/chat", label: "AI 聊天" },
  { href: "/polish", label: "论文润色" },
  { href: "/writing", label: "论文撰写" },
  { href: "/references", label: "文献搜索" },
  { href: "/convert", label: "繁简转换" },
  { href: "/settings", label: "设置" },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950", className)}>
      <div className="mb-6">
        <p className="text-xl font-semibold">PhD-Doc</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">Geology AI Workspace</p>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-3 py-2 text-sm transition-colors",
              pathname === link.href
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
