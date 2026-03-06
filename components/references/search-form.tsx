import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SearchFormProps {
  mode: "search" | "recommend";
  input: string;
  onModeChange: (mode: "search" | "recommend") => void;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function SearchForm({
  mode,
  input,
  onModeChange,
  onInputChange,
  onSubmit,
  loading,
}: SearchFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant={mode === "search" ? "default" : "outline"} onClick={() => onModeChange("search")}>
          文献搜索
        </Button>
        <Button
          variant={mode === "recommend" ? "default" : "outline"}
          onClick={() => onModeChange("recommend")}
        >
          AI 推荐生成
        </Button>
      </div>
      <Textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        className="min-h-28"
        placeholder={mode === "search" ? "输入关键词，支持逗号分隔" : "输入研究主题描述或论文段落"}
      />
      <Button onClick={onSubmit} disabled={loading || !input.trim()}>
        {loading ? "处理中..." : mode === "search" ? "开始搜索" : "生成推荐"}
      </Button>
    </div>
  );
}
