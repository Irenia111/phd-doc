import { Textarea } from "@/components/ui/textarea";

interface InputFormProps {
  inputSummary: string;
  existingDraft: string;
  references: string;
  requirements: string;
  onChange: (
    field: "inputSummary" | "existingDraft" | "references" | "requirements",
    value: string
  ) => void;
}

export function InputForm({ inputSummary, existingDraft, references, requirements, onChange }: InputFormProps) {
  return (
    <div className="space-y-3">
      <label className="space-y-1 text-sm">
        <span>研究发现/数据摘要（核心输入）</span>
        <Textarea
          value={inputSummary}
          onChange={(e) => onChange("inputSummary", e.target.value)}
          className="min-h-24"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>用户已有内容（可选，作为续写基础）</span>
        <Textarea
          value={existingDraft}
          onChange={(e) => onChange("existingDraft", e.target.value)}
          className="min-h-24"
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>参考文献要点（可选）</span>
        <Textarea value={references} onChange={(e) => onChange("references", e.target.value)} />
      </label>
      <label className="space-y-1 text-sm">
        <span>写作要求</span>
        <Textarea value={requirements} onChange={(e) => onChange("requirements", e.target.value)} />
      </label>
    </div>
  );
}
