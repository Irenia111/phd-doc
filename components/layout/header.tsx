"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiKey } from "@/hooks/use-api-key";
import { Button } from "@/components/ui/button";

const pageMap: Record<string, string> = {
  "/": "首页",
  "/chat": "AI 聊天",
  "/polish": "论文润色",
  "/writing": "论文撰写",
  "/references": "文献搜索",
  "/convert": "繁简转换",
  "/settings": "设置",
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { status } = useApiKey();
  const title = pageMap[pathname] ?? "PhD-Doc";

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" className="md:hidden" onClick={onMenuClick}>
          菜单
        </Button>
        <h1 className="text-base font-medium">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <div>
          API Key:
          <span className={status === "configured" ? "ml-1 text-emerald-600" : "ml-1 text-amber-600"}>
            {status === "configured" ? "已配置" : "未配置"}
          </span>
        </div>
        <Link className="underline" href="/settings">
          设置
        </Link>
      </div>
    </header>
  );
}
