import { MessageBubble } from "@/components/chat/message-bubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: number;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        还没有消息，输入问题开始对话。
      </div>
    );
  }

  return (
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
  );
}
