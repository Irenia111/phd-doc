import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  return (
    <div className={`mb-4 flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 text-sm ${
          role === "user"
            ? "bg-slate-900 text-white"
            : "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        {timestamp ? (
          <p className="mt-2 text-right text-[10px] opacity-70">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
