import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  onStop: () => void;
}

export function ChatInput({ value, onChange, onSubmit, loading, onStop }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="输入你的问题，例如：庙湾变质超基性岩记录了哪些初始俯冲证据？"
        className="min-h-28"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={!value.trim() || loading}>
          发送
        </Button>
        <Button type="button" variant="outline" onClick={onStop} disabled={!loading}>
          停止生成
        </Button>
      </div>
    </form>
  );
}
