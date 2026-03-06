import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PolishResult } from "@/types";

interface ResultPanelProps {
  result: PolishResult;
  onAdopt: (text: string) => void;
  onCopy: (text: string) => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.min(100, Math.max(0, value * 10));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function ResultPanel({ result, onAdopt, onCopy }: ResultPanelProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{result.model}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">{result.status}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">润色结果</p>
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 p-2 text-xs dark:border-slate-700">
          {result.polishedText || "暂无结果"}
        </pre>
      </div>
      {result.review ? (
        <div className="space-y-2 text-xs">
          <ScoreBar label="术语准确性" value={result.review.scores.terminology} />
          <ScoreBar label="学术规范性" value={result.review.scores.academicStyle} />
          <ScoreBar label="语言流畅度" value={result.review.scores.fluency} />
          <ScoreBar label="忠实度" value={result.review.scores.faithfulness} />
          <ScoreBar label="综合评分" value={result.review.scores.overall} />
          <p className="text-slate-600 dark:text-slate-300">{result.review.comment}</p>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onCopy(result.polishedText || "")}>
          复制
        </Button>
        <Button onClick={() => onAdopt(result.polishedText)}>采纳为最终版本</Button>
      </div>
    </Card>
  );
}
