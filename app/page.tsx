import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const items = [
  { href: "/chat", title: "AI 聊天", desc: "地质方向专业问答与多轮对话" },
  { href: "/polish", title: "论文润色", desc: "中英翻译、润色与多模型对比" },
  { href: "/writing", title: "论文撰写", desc: "Discussion/Introduction 等章节辅助" },
  { href: "/references", title: "文献搜索", desc: "文献检索、推荐与本地文献库" },
  { href: "/convert", title: "繁简转换", desc: "基于 OpenCC 的实时文本转换" },
  { href: "/settings", title: "设置", desc: "OpenRouter API Key 和偏好管理" },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">PhD-Doc</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          面向扬子克拉通研究方向的学术 AI 工作台
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:border-slate-400">
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
