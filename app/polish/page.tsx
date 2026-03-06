"use client";

import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ResultPanel } from "@/components/polish/result-panel";
import { SourceEditor } from "@/components/polish/source-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { runEditorReview, runPolishModel } from "@/app/polish/actions";
import { useApiKey } from "@/hooks/use-api-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_MODEL, getModelDescription, MODEL_OPTIONS } from "@/lib/models";
import { showToast } from "@/lib/toast";
import { EditorReview, PolishRecord, PolishResult, UserPreferences } from "@/types";

const defaultPreferences: UserPreferences = {
  defaultModel: DEFAULT_MODEL,
  editorModel: DEFAULT_MODEL,
  theme: "system",
  language: "zh-CN",
};

export default function PolishPage() {
  const { apiKey, status } = useApiKey();
  const { value: preferences } = useLocalStorage<UserPreferences>("preferences", defaultPreferences);
  const { value: history, setValue: setHistory } = useLocalStorage<PolishRecord[]>("polish-history", []);
  const [sourceText, setSourceText] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([
    preferences.defaultModel || DEFAULT_MODEL,
  ]);
  const [results, setResults] = useState<PolishResult[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [adoptedText, setAdoptedText] = useState("");
  const [customModel, setCustomModel] = useState("");

  const modelOptions = useMemo(
    () =>
      MODEL_OPTIONS.map((m) => ({
        ...m,
        selected: selectedModels.includes(m.value),
      })),
    [selectedModels]
  );

  function toggleModel(model: string) {
    setSelectedModels((prev) => {
      if (prev.includes(model)) {
        return prev.filter((m) => m !== model);
      }
      if (prev.length >= 4) return prev;
      return [...prev, model];
    });
  }

  async function runPolish() {
    if (!sourceText.trim() || selectedModels.length < 2 || selectedModels.length > 4) return;
    setLoading(true);
    setResults(
      selectedModels.map((model) => ({
        model,
        translatedText: "",
        polishedText: "",
        status: "generating",
      }))
    );
    setRecommendation("");
    try {
      const tasks = selectedModels.map((targetModel) =>
        runPolishModel({
          apiKey,
          model: targetModel,
          sourceText,
        })
          .then((result) => {
            setResults((prev) =>
              prev.map((item) => (item.model === targetModel ? { ...result, status: "done" } : item))
            );
            return result;
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : "处理失败";
            setResults((prev) =>
              prev.map((item) =>
                item.model === targetModel ? { ...item, status: "error", error: message } : item
              )
            );
            return null;
          })
      );

      const settled = await Promise.all(tasks);
      const successResults = settled.filter((item) => item !== null) as PolishResult[];

      let review: EditorReview | null = null;
      if (successResults.length > 0) {
        review = await runEditorReview({
          apiKey,
          editorModel: preferences.editorModel || DEFAULT_MODEL,
          sourceText,
          results: successResults,
        });
      }

      const merged = successResults.map((result) => {
        const modelReview = review?.modelReviews?.find((item) => item.model === result.model);
        return {
          ...result,
          review: modelReview
            ? {
                scores: modelReview.scores,
                comment: modelReview.comment,
              }
            : undefined,
          status: "done" as const,
        };
      });
      setResults((prev) =>
        prev.map((item) => merged.find((m) => m.model === item.model) ?? item)
      );
      setRecommendation(review?.recommendation ?? "");

      const record: PolishRecord = {
        id: uuidv4(),
        sourceText,
        selectedModels,
        results: [
          ...merged,
          ...selectedModels
            .filter((modelName) => !merged.find((result) => result.model === modelName))
            .map(
              (modelName) =>
                ({
                  model: modelName,
                  translatedText: "",
                  polishedText: "",
                  status: "error",
                  error: "模型执行失败",
                }) satisfies PolishResult
            ),
        ],
        editorModel: preferences.editorModel || DEFAULT_MODEL,
        recommendation: review?.recommendation ?? "",
        createdAt: Date.now(),
      };
      setHistory((prev) => [record, ...prev].slice(0, 50));
    } catch (error) {
      const message = error instanceof Error ? error.message : "处理失败";
      setResults((prev) =>
        prev.map((item) => ({
          ...item,
          status: "error",
          error: message,
        }))
      );
    } finally {
      setLoading(false);
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
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <SourceEditor value={sourceText} onChange={setSourceText} />
          <div className="space-y-2">
            <p className="text-sm font-medium">模型选择（2-4 个推荐）</p>
            <div className="grid gap-2 md:grid-cols-2">
              {modelOptions.map((option) => (
                <label
                  key={option.value}
                  className="rounded-md border border-slate-200 p-2 text-sm dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.selected}
                      onChange={() => toggleModel(option.value)}
                    />
                    <span>{option.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{option.description}</p>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={customModel}
                onChange={(event) => setCustomModel(event.target.value)}
                placeholder="添加 OpenRouter 模型 ID（可用于任意支持模型）"
                className="w-full md:flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const modelId = customModel.trim();
                  if (!modelId) return;
                  setSelectedModels((prev) => {
                    if (prev.includes(modelId) || prev.length >= 4) return prev;
                    return [...prev, modelId];
                  });
                  setCustomModel("");
                }}
              >
                添加自定义模型
              </Button>
            </div>
            {!!selectedModels.length && (
              <div className="space-y-1">
                {selectedModels.map((item) => (
                  <p key={item} className="text-xs text-slate-600 dark:text-slate-300">
                    {item} - {getModelDescription(item)}
                  </p>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={runPolish}
            disabled={loading || selectedModels.length < 2 || selectedModels.length > 4}
          >
            {loading ? "处理中..." : "开始翻译与润色"}
          </Button>
          {selectedModels.length < 2 || selectedModels.length > 4 ? (
            <p className="text-xs text-amber-600">请严格选择 2-4 个模型。</p>
          ) : null}
          {recommendation ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Editor 推荐：{recommendation}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium">最终采纳版本</p>
          <textarea
            className="min-h-[300px] w-full rounded-md border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={adoptedText}
            onChange={(event) => setAdoptedText(event.target.value)}
            placeholder="可将任一模型结果采纳到这里后继续编辑"
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <ResultPanel
            key={result.model}
            result={result}
            onAdopt={setAdoptedText}
            onCopy={(text) => {
              navigator.clipboard.writeText(text);
              showToast("已复制润色结果");
            }}
          />
        ))}
      </div>

      <Card className="space-y-3">
        <p className="text-sm font-medium">历史记录（最近 10 条）</p>
        <div className="space-y-2">
          {history.slice(0, 10).map((record) => (
            <button
              key={record.id}
              type="button"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm dark:border-slate-700"
              onClick={() => {
                setSourceText(record.sourceText);
                setSelectedModels(record.selectedModels);
                setResults(record.results);
                setRecommendation(record.recommendation);
                setAdoptedText(record.results[0]?.polishedText ?? "");
              }}
            >
              {new Date(record.createdAt).toLocaleString()} - {record.sourceText.slice(0, 40)}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
