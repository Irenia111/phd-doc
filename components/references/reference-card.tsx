import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reference } from "@/types";

interface ReferenceCardProps {
  reference: Reference;
  onSave: (reference: Reference) => void;
  onToggleVerify: (id: string) => void;
  onCopyCitation: (reference: Reference, format: "apa" | "gbt") => void;
}

export function ReferenceCard({ reference, onSave, onToggleVerify, onCopyCitation }: ReferenceCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold">{reference.title}</p>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {reference.authors} | {reference.journal} | {reference.year}
      </p>
      <p className="text-xs">{reference.abstract}</p>
      <p className="text-xs">
        DOI:{" "}
        {reference.doi ? (
          <a
            href={`https://doi.org/${reference.doi.replace(/^https?:\/\/doi\.org\//, "")}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {reference.doi}
          </a>
        ) : (
          "待核实"
        )}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-300">相关性: {reference.relevance}</p>
      {reference.source === "ai-generated" ? (
        <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
          AI 生成，请核实（置信度: {reference.confidence ?? "unknown"}）
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onSave(reference)}>
          收藏
        </Button>
        <Button variant="outline" onClick={() => onCopyCitation(reference, "apa")}>
          APA
        </Button>
        <Button variant="outline" onClick={() => onCopyCitation(reference, "gbt")}>
          GB/T
        </Button>
        <Button variant="outline" onClick={() => onToggleVerify(reference.id)}>
          {reference.verified ? "标记未验证" : "标记已验证"}
        </Button>
      </div>
    </Card>
  );
}
