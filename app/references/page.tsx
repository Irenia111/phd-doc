"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { ReferenceCard } from "@/components/references/reference-card";
import { ReferenceLibrary } from "@/components/references/reference-library";
import { SearchForm } from "@/components/references/search-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useApiKey } from "@/hooks/use-api-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_MODEL, getModelDescription, getModelOptionLabel, MODEL_OPTIONS } from "@/lib/models";
import { showToast } from "@/lib/toast";
import { Reference, ReferenceSearchRecord, UserPreferences } from "@/types";

const defaultPreferences: UserPreferences = {
  defaultModel: DEFAULT_MODEL,
  editorModel: DEFAULT_MODEL,
  theme: "system",
  language: "zh-CN",
};

const quickKeywords = [
  "Yangtze Craton ultramafic",
  "Miaowan metamorphosed ultramafic",
  "Neoproterozoic subduction initiation",
  "Re-Os isotope ultramafic",
  "Zircon U-Pb Neoproterozoic Yangtze",
  "Rodinia assembly South China",
];

const MIN_YEAR = 1800;
const MAX_YEAR = new Date().getFullYear() + 1;

function toValidYear(value: string) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return undefined;
  if (num < MIN_YEAR || num > MAX_YEAR) return undefined;
  return num;
}

function normalizeYearInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

function parseNaturalLanguageFilter(rawInput: string) {
  let startYear: number | undefined;
  let endYear: number | undefined;
  let text = rawInput;

  const rangePatterns = [
    /((?:18|19|20)\d{2})\s*年?\s*(?:-|—|~|至|到)\s*((?:18|19|20)\d{2})\s*年?/i,
    /(?:between|from)\s+((?:18|19|20)\d{2})\s+(?:and|to|until)\s+((?:18|19|20)\d{2})/i,
  ];
  for (const pattern of rangePatterns) {
    const matched = text.match(pattern);
    if (!matched) continue;
    startYear = Number.parseInt(matched[1], 10);
    endYear = Number.parseInt(matched[2], 10);
    text = text.replace(matched[0], " ");
    break;
  }

  if (startYear === undefined) {
    const afterPatterns = [
      /((?:18|19|20)\d{2})\s*年?\s*(?:起|以来|之后|以后)/i,
      /(?:after|since)\s+((?:18|19|20)\d{2})/i,
      /(?:>=|大于等于|不早于)\s*((?:18|19|20)\d{2})/i,
    ];
    for (const pattern of afterPatterns) {
      const matched = text.match(pattern);
      if (!matched) continue;
      startYear = Number.parseInt(matched[1], 10);
      text = text.replace(matched[0], " ");
      break;
    }
  }

  if (endYear === undefined) {
    const beforePatterns = [
      /((?:18|19|20)\d{2})\s*年?\s*(?:之前|以前|之前的)/i,
      /(?:before|until)\s+((?:18|19|20)\d{2})/i,
      /(?:<=|小于等于|不晚于)\s*((?:18|19|20)\d{2})/i,
    ];
    for (const pattern of beforePatterns) {
      const matched = text.match(pattern);
      if (!matched) continue;
      endYear = Number.parseInt(matched[1], 10);
      text = text.replace(matched[0], " ");
      break;
    }
  }

  if (startYear === undefined && endYear === undefined) {
    const exactYearMatched = text.match(/(^|\s)((?:18|19|20)\d{2})\s*年(?!\d)/);
    if (exactYearMatched) {
      const year = Number.parseInt(exactYearMatched[2], 10);
      startYear = year;
      endYear = year;
      text = text.replace(exactYearMatched[0], " ");
    }
  }

  if (startYear !== undefined && endYear !== undefined && startYear > endYear) {
    [startYear, endYear] = [endYear, startYear];
  }

  const cleanedText = text.replace(/\s+/g, " ").trim();

  return {
    cleanedText,
    startYear: startYear && startYear >= MIN_YEAR && startYear <= MAX_YEAR ? startYear : undefined,
    endYear: endYear && endYear >= MIN_YEAR && endYear <= MAX_YEAR ? endYear : undefined,
  };
}

function extractReferenceYear(yearText: string) {
  const matched = yearText.match(/((?:18|19|20)\d{2})/);
  if (!matched) return undefined;
  return Number.parseInt(matched[1], 10);
}

function filterByYear(items: Reference[], startYear?: number, endYear?: number) {
  if (startYear === undefined && endYear === undefined) return items;
  return items.filter((item) => {
    const year = extractReferenceYear(item.year);
    if (!year) return false;
    if (startYear !== undefined && year < startYear) return false;
    if (endYear !== undefined && year > endYear) return false;
    return true;
  });
}

export default function ReferencesPage() {
  const { apiKey, status } = useApiKey();
  const { value: preferences } = useLocalStorage<UserPreferences>("preferences", defaultPreferences);
  const { value: library, setValue: setLibrary } = useLocalStorage<Reference[]>("references", []);
  const { setValue: setSearchHistory } = useLocalStorage<ReferenceSearchRecord[]>("reference-searches", []);

  const [mode, setMode] = useState<"search" | "recommend">("search");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Reference[]>([]);
  const [libraryKeyword, setLibraryKeyword] = useState("");
  const [yearStartText, setYearStartText] = useState("");
  const [yearEndText, setYearEndText] = useState("");
  const [model, setModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [customModel, setCustomModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [loading, setLoading] = useState(false);

  const parsed = parseNaturalLanguageFilter(input);
  const manualStartYear = toValidYear(yearStartText);
  const manualEndYear = toValidYear(yearEndText);
  const startYear = manualStartYear ?? parsed.startYear;
  const endYear = manualEndYear ?? parsed.endYear;

  function toApa(reference: Reference) {
    return `${reference.authors} (${reference.year}). ${reference.title}. ${reference.journal}. DOI: ${reference.doi}`;
  }

  function toGbt(reference: Reference) {
    return `${reference.authors}. ${reference.title}[J]. ${reference.journal}, ${reference.year}. DOI: ${reference.doi}`;
  }

  function copyCitation(reference: Reference, format: "apa" | "gbt") {
    const text = format === "apa" ? toApa(reference) : toGbt(reference);
    navigator.clipboard.writeText(text);
    showToast(`已复制${format === "apa" ? "APA" : "GB/T 7714"}引用`);
  }

  async function runSearch() {
    const sourceQuery = input.trim();
    const queryText = (parsed.cleanedText || sourceQuery).trim();
    if (!queryText && startYear === undefined && endYear === undefined) {
      showToast("请输入关键词或自然语言描述");
      return;
    }

    const yearHint =
      startYear !== undefined || endYear !== undefined
        ? `（年份限制: ${startYear ?? "不限"}-${endYear ?? "不限"}）`
        : "";
    const inputText = `${queryText || "文献推荐"} ${yearHint}`.trim();

    setLoading(true);
    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "references",
          apiKey,
          model,
          payload: { mode, inputText },
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { references: Reference[]; raw: string };
        error?: string;
      };
      if (!json.ok || !json.data) throw new Error(json.error ?? "查询失败");

      const normalized: Reference[] = json.data.references.map((item) => ({
        id: item.id || uuidv4(),
        title: item.title ?? "Untitled",
        authors: item.authors ?? "待核实",
        journal: item.journal ?? "待核实",
        year: item.year ?? "待核实",
        doi: item.doi ?? "",
        abstract: item.abstract ?? "",
        source: (mode === "search" ? "search" : "ai-generated") as "search" | "ai-generated",
        verified: false,
        confidence: item.confidence,
        relevance: item.relevance ?? "",
        createdAt: Date.now(),
      }));
      const filtered = filterByYear(normalized, startYear, endYear);
      setResults(filtered);

      setSearchHistory((prev) => [
        {
          id: uuidv4(),
          keywords: mode === "search" ? queryText.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) : [],
          mode,
          inputText: sourceQuery,
          results: filtered,
          model,
          createdAt: Date.now(),
        },
        ...prev,
      ]);

      if (filtered.length !== normalized.length) {
        showToast(`已按年份筛选，保留 ${filtered.length}/${normalized.length} 条`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "查询失败";
      setResults([
        {
          id: uuidv4(),
          title: "请求失败",
          authors: "系统",
          journal: "",
          year: "",
          doi: "",
          abstract: msg,
          source: "ai-generated",
          verified: false,
          confidence: "low",
          relevance: "请稍后重试",
          createdAt: Date.now(),
        },
      ]);
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
      <Card className="space-y-3">
        <Select
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
            setCustomModel(event.target.value);
          }}
          options={MODEL_OPTIONS.map((m) => ({ label: getModelOptionLabel(m), value: m.value }))}
        />
        <div className="space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">当前模型擅长：{getModelDescription(model)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={customModel}
              onChange={(event) => setCustomModel(event.target.value)}
              placeholder="输入 OpenRouter 模型 ID，如 deepseek/deepseek-reasoner"
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
        <div className="flex flex-wrap gap-2">
          {quickKeywords.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
              onClick={() => setInput(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
        <div className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="起始年份，如 2018"
              value={yearStartText}
              onChange={(event) => setYearStartText(normalizeYearInput(event.target.value))}
              className="w-full md:w-44"
            />
            <span className="text-sm text-slate-500">-</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="结束年份，如 2022"
              value={yearEndText}
              onChange={(event) => setYearEndText(normalizeYearInput(event.target.value))}
              className="w-full md:w-44"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setYearStartText("");
                setYearEndText("");
              }}
            >
              清空年份限制
            </Button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            支持自然语言年份条件，如“2018到2022 年”“2020 年以后”“before 2019”。手动填写年份会优先于自动识别。
          </p>
          {(startYear !== undefined || endYear !== undefined) && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              当前生效年份范围：{startYear ?? "不限"} - {endYear ?? "不限"}
            </p>
          )}
        </div>
        <SearchForm
          mode={mode}
          input={input}
          onModeChange={setMode}
          onInputChange={setInput}
          onSubmit={runSearch}
          loading={loading}
        />
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((reference) => (
          <ReferenceCard
            key={reference.id}
            reference={reference}
            onSave={(item) =>
              setLibrary((prev) =>
                prev.find((x) => (x.doi && item.doi ? x.doi === item.doi : x.id === item.id))
                  ? prev
                  : [item, ...prev]
              )
            }
            onToggleVerify={(id) =>
              setResults((prev) =>
                prev.map((item) => (item.id === id ? { ...item, verified: !item.verified } : item))
              )
            }
            onCopyCitation={copyCitation}
          />
        ))}
      </div>

      {!!results.length && (
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">当前结果批量导出</p>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"
              onClick={() => {
                const output = results.map((item) => toApa(item)).join("\n");
                navigator.clipboard.writeText(output);
                showToast("已导出当前结果（APA）");
              }}
            >
              导出当前结果
            </button>
          </div>
        </Card>
      )}

      <ReferenceLibrary
        items={library}
        keyword={libraryKeyword}
        onKeywordChange={setLibraryKeyword}
        onDelete={(id) => setLibrary((prev) => prev.filter((item) => item.id !== id))}
        onExport={() => {
          const output = library.map((item) => toApa(item)).join("\n");
          navigator.clipboard.writeText(output);
          showToast("已导出本地文献库");
        }}
        onEdit={(id, next) =>
          setLibrary((prev) => prev.map((item) => (item.id === id ? { ...item, ...next } : item)))
        }
        onCopyCitation={copyCitation}
      />
    </div>
  );
}
