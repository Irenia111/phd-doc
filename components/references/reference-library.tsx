import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reference } from "@/types";

interface ReferenceLibraryProps {
  items: Reference[];
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onEdit: (id: string, next: Partial<Reference>) => void;
  onCopyCitation: (reference: Reference, format: "apa" | "gbt") => void;
}

export function ReferenceLibrary({
  items,
  keyword,
  onKeywordChange,
  onDelete,
  onExport,
  onEdit,
  onCopyCitation,
}: ReferenceLibraryProps) {
  const filtered = items.filter((item) =>
    [item.title, item.authors, item.journal].join(" ").toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">本地文献库</p>
        <Button variant="outline" onClick={onExport}>
          导出文本
        </Button>
      </div>
      <Input value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="搜索文献库" />
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {item.authors} ({item.year}) {item.journal}
            </p>
            <div className="mt-1 flex gap-2">
              <Button variant="outline" onClick={() => onCopyCitation(item, "apa")}>
                复制引用(APA)
              </Button>
              <Button variant="outline" onClick={() => onCopyCitation(item, "gbt")}>
                复制引用(GB/T 7714)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const title = window.prompt("标题", item.title);
                  if (!title) return;
                  const authors = window.prompt("作者", item.authors) ?? item.authors;
                  const journal = window.prompt("期刊", item.journal) ?? item.journal;
                  const year = window.prompt("年份", item.year) ?? item.year;
                  const doi = window.prompt("DOI", item.doi) ?? item.doi;
                  onEdit(item.id, { title, authors, journal, year, doi });
                }}
              >
                编辑
              </Button>
              <Button variant="destructive" onClick={() => onDelete(item.id)}>
                删除
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
