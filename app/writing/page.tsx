"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { v4 as uuidv4 } from "uuid";
import { InputForm } from "@/components/writing/input-form";
import { ModeSelector } from "@/components/writing/mode-selector";
import { OutputPanel } from "@/components/writing/output-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useApiKey } from "@/hooks/use-api-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_MODEL, getModelDescription, getModelOptionLabel, MODEL_OPTIONS } from "@/lib/models";
import { UserPreferences, WritingMode, WritingRecord } from "@/types";

const defaultPreferences: UserPreferences = {
  defaultModel: DEFAULT_MODEL,
  editorModel: DEFAULT_MODEL,
  theme: "system",
  language: "zh-CN",
};

const sectionTemplates: Record<WritingMode, string[]> = {
  discussion: ["结果解读", "机制分析", "与前人对比", "不确定性与局限", "地质意义"],
  introduction: ["研究背景", "科学问题", "前人研究现状", "研究空缺", "本文目标与贡献"],
  abstract: ["研究背景", "方法", "关键结果", "结论与意义"],
  conclusion: ["主要结论", "创新点", "应用与启示", "未来工作"],
  free: ["背景段", "论证段", "结果段", "结论段"],
};

export default function WritingPage() {
  const { apiKey, status } = useApiKey();
  const { value: preferences } = useLocalStorage<UserPreferences>("preferences", defaultPreferences);
  const { value: history, setValue: setHistory } = useLocalStorage<WritingRecord[]>("writing-history", []);

  const [mode, setMode] = useState<WritingMode>("discussion");
  const [inputSummary, setInputSummary] = useState("");
  const [existingDraft, setExistingDraft] = useState("");
  const [references, setReferences] = useState("");
  const [requirements, setRequirements] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<"zh" | "en">("en");
  const [generatedText, setGeneratedText] = useState("");
  const [targetSections, setTargetSections] = useState<string[]>(sectionTemplates.discussion);
  const [model, setModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [customModel, setCustomModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [streamMode, setStreamMode] = useState(false);
  const { completion, complete, stop, isLoading } = useCompletion({
    api: "/api/writing",
  });

  async function runGenerate(extraInstruction?: string) {
    try {
      if (!inputSummary.trim() && !existingDraft.trim()) {
        setGeneratedText((prev) => `${prev}\n\n[提示] 请至少输入“研究摘要”或“用户已有内容”。`.trim());
        return;
      }
      const selectedSections = targetSections.length ? targetSections : sectionTemplates[mode];
      const sectionInstruction = `请只输出以下板块的段落草稿（不要输出全文，每个板块 1-2 段）：${selectedSections.join("、")}
输出格式要求：
1) 使用 markdown 三级标题标识板块，例如：### 研究背景
2) 每段尽量控制在 120-220 词（中文可按信息量等效）
3) 明确引用用户提供的输入信息，不要编造未给出的实验数据`;
      const effectiveRequirements = extraInstruction ? `${requirements}\n${extraInstruction}` : requirements;
      const mergedRequirements = effectiveRequirements
        ? `${effectiveRequirements}\n${sectionInstruction}`
        : sectionInstruction;

      setStreamMode(true);
      const text = await complete(inputSummary, {
        body: {
          apiKey,
          model,
          mode,
          inputSummary,
          existingDraft,
          references,
          requirements: mergedRequirements,
          outputLanguage,
          targetSections: selectedSections,
        },
      });
      if (!text) throw new Error("生成失败");

      const finalText = extraInstruction ? `${generatedText}\n\n${text}` : text;
      setGeneratedText(finalText);
      setStreamMode(false);

      const now = Date.now();
      const record: WritingRecord = {
        id: uuidv4(),
        mode,
        targetSections: selectedSections,
        inputSummary,
        existingDraft,
        references,
        requirements: mergedRequirements,
        outputLanguage,
        generatedText: finalText,
        model,
        createdAt: now,
        updatedAt: now,
      };
      setHistory((prev) => [record, ...prev].slice(0, 50));
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成失败";
      setGeneratedText((prev) => `${prev}\n\n[错误] ${message}`);
      setStreamMode(false);
    }
  }

  if (status !== "configured") {
    return (
      <Card>
        <p className="text-sm">
          尚未配置 API Key。请先前往 <a href="/settings" className="underline">设置页面</a> 完成配置。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <ModeSelector
          value={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            setTargetSections(sectionTemplates[nextMode]);
          }}
        />
        <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">生成板块（可多选）</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTargetSections(sectionTemplates[mode])}
            >
              使用当前模式推荐板块
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionTemplates[mode].map((section) => {
              const active = targetSections.includes(section);
              return (
                <button
                  key={section}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                  onClick={() =>
                    setTargetSections((prev) =>
                      prev.includes(section) ? prev.filter((x) => x !== section) : [...prev, section]
                    )
                  }
                >
                  {section}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            当前会按板块生成分段文本。若未选择板块，将自动使用当前模式的默认板块。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setCustomModel(e.target.value);
            }}
            options={MODEL_OPTIONS.map((m) => ({ label: getModelOptionLabel(m), value: m.value }))}
          />
          <Select
            value={outputLanguage}
            onChange={(e) => setOutputLanguage(e.target.value as "zh" | "en")}
            options={[
              { label: "英文输出", value: "en" },
              { label: "中文输出", value: "zh" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">当前模型擅长：{getModelDescription(model)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={customModel}
              onChange={(event) => setCustomModel(event.target.value)}
              placeholder="输入 OpenRouter 模型 ID，如 anthropic/claude-3.7-sonnet"
              className="w-full md:flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const next = customModel.trim();
                if (!next) return;
                setModel(next);
              }}
            >
              使用自定义模型
            </Button>
          </div>
        </div>
        <InputForm
          inputSummary={inputSummary}
          existingDraft={existingDraft}
          references={references}
          requirements={requirements}
          onChange={(field, value) => {
            if (field === "inputSummary") setInputSummary(value);
            if (field === "existingDraft") setExistingDraft(value);
            if (field === "references") setReferences(value);
            if (field === "requirements") setRequirements(value);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runGenerate()} disabled={isLoading}>
            {isLoading ? "生成中..." : "生成草稿"}
          </Button>
          <Button
            variant="outline"
            onClick={() => runGenerate("请在已有内容基础上继续扩展。")}
            disabled={isLoading}
          >
            继续扩展
          </Button>
          <Button
            variant="outline"
            onClick={() => runGenerate("请基于现有草稿做定向修改，重点提升逻辑衔接和论证严谨性。")}
            disabled={isLoading}
          >
            修改建议后重写
          </Button>
          <Button variant="outline" onClick={stop} disabled={!isLoading}>
            停止生成
          </Button>
        </div>
      </Card>

      <OutputPanel text={streamMode ? completion : generatedText} />

      <Card className="space-y-2">
        <p className="text-sm font-medium">历史记录</p>
        {history.slice(0, 10).map((record) => (
          <button
            key={record.id}
            type="button"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm dark:border-slate-700"
            onClick={() => {
              setMode(record.mode);
              setTargetSections(record.targetSections?.length ? record.targetSections : sectionTemplates[record.mode]);
              setInputSummary(record.inputSummary);
              setExistingDraft(record.existingDraft ?? "");
              setReferences(record.references);
              setRequirements(record.requirements);
              setOutputLanguage(record.outputLanguage);
              setGeneratedText(record.generatedText);
              setModel(record.model);
              setCustomModel(record.model);
            }}
          >
            {new Date(record.createdAt).toLocaleString()} - {record.mode}
          </button>
        ))}
      </Card>
    </div>
  );
}
