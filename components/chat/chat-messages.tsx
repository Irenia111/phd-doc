import { MessageBubble } from "@/components/chat/message-bubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: number;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  hasReferences?: boolean;
}

export function ChatMessages({ messages, hasReferences }: ChatMessagesProps) {
  if (!messages.length) {
    return (
      <div className="space-y-3">
        <AiDisclaimer hasReferences={hasReferences} />
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          还没有消息，输入问题开始对话。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AiDisclaimer hasReferences={hasReferences} />
      <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.createdAt}
          />
        ))}
      </div>
    </div>
  );
}

function AiDisclaimer({ hasReferences }: { hasReferences?: boolean }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="mr-1 font-medium">提示：</span>
      AI 回复可能包含不准确的信息，特别是文献引用和具体数据。请务必核实关键内容。
      {hasReferences ? (
        <span className="ml-1 text-green-700 dark:text-green-400">
          （已加载 {hasReferences ? "已验证" : ""}文献库作为参考）
        </span>
      ) : (
        <span className="ml-1">
          前往<a href="/references" className="underline">文献搜索</a>添加已验证文献可提升回答准确性。
        </span>
      )}
    </div>
  );
}
