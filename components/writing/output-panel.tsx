import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface OutputPanelProps {
  text: string;
}

export function OutputPanel({ text }: OutputPanelProps) {
  return (
    <div className="min-h-[350px] rounded-md border border-slate-200 p-4 text-sm dark:border-slate-700">
      {text ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      ) : (
        <p className="text-slate-500">尚未生成内容。</p>
      )}
    </div>
  );
}
