import { Textarea } from "@/components/ui/textarea";

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceEditor({ value, onChange }: SourceEditorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">中文原文</p>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="输入或粘贴需要翻译与润色的中文段落"
        className="min-h-[300px]"
      />
    </div>
  );
}
