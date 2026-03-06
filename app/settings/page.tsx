"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiKey } from "@/hooks/use-api-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_MODEL, getModelDescription, getModelOptionLabel, MODEL_OPTIONS } from "@/lib/models";
import { UserPreferences } from "@/types";

const defaultPreferences: UserPreferences = {
  defaultModel: DEFAULT_MODEL,
  editorModel: DEFAULT_MODEL,
  theme: "system",
  language: "zh-CN",
};

export default function SettingsPage() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [draft, setDraft] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);
  const { value: preferences, setValue: setPreferences } = useLocalStorage<UserPreferences>(
    "preferences",
    defaultPreferences
  );

  const isKeyFormatValid = draft.startsWith("sk-or-v1-");

  async function verifyKey() {
    setLoading(true);
    setStatusText("验证中...");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: draft }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        setStatusText(json.error ?? "验证失败");
        return;
      }
      setApiKey(draft.trim());
      setStatusText("验证成功并已保存");
    } catch {
      setStatusText("验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <CardTitle>OpenRouter API Key</CardTitle>
        <CardDescription>密钥保存在浏览器本地 localStorage，不上传到数据库。</CardDescription>
        <Input
          type={showKey ? "text" : "password"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="sk-or-v1-..."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowKey((v) => !v)}>
            {showKey ? "隐藏" : "显示"}
          </Button>
          <Button onClick={verifyKey} disabled={!isKeyFormatValid || loading}>
            验证并保存
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearApiKey();
              setDraft("");
              setStatusText("已清除");
            }}
          >
            清除 Key
          </Button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          当前状态：{apiKey ? "已配置" : "未配置"} {statusText ? `| ${statusText}` : ""}
        </p>
      </Card>

      <Card className="space-y-4">
        <CardTitle>模型偏好</CardTitle>
        <CardDescription>设置默认对话模型和评审模型。</CardDescription>
        <label className="space-y-1 text-sm">
          <span>默认模型</span>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={preferences.defaultModel}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, defaultModel: e.target.value }))
            }
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.value} value={model.value}>
                {getModelOptionLabel(model)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            擅长：{getModelDescription(preferences.defaultModel)}
          </p>
          <Input
            value={preferences.defaultModel}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, defaultModel: e.target.value }))
            }
            placeholder="或输入任意 OpenRouter 模型 ID"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Editor 评审模型</span>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={preferences.editorModel}
            onChange={(e) => setPreferences((prev) => ({ ...prev, editorModel: e.target.value }))}
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.value} value={model.value}>
                {getModelOptionLabel(model)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            擅长：{getModelDescription(preferences.editorModel)}
          </p>
          <Input
            value={preferences.editorModel}
            onChange={(e) => setPreferences((prev) => ({ ...prev, editorModel: e.target.value }))}
            placeholder="或输入任意 OpenRouter 模型 ID"
          />
        </label>
      </Card>
    </div>
  );
}
