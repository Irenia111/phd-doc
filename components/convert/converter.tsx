"use client";

import { useMemo, useState } from "react";
import { Converter as createConverter } from "opencc-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";

type ConvertMode = "tw2cn" | "hk2cn" | "cn2tw";

const modeOptions: Array<{ value: ConvertMode; label: string; from: string; to: string }> = [
  { value: "tw2cn", label: "繁中(台湾) -> 简中", from: "tw", to: "cn" },
  { value: "hk2cn", label: "繁中(香港) -> 简中", from: "hk", to: "cn" },
  { value: "cn2tw", label: "简中 -> 繁中(台湾)", from: "cn", to: "tw" },
];

export function Converter() {
  const [mode, setMode] = useState<ConvertMode>("tw2cn");
  const [input, setInput] = useState("");

  const converter = useMemo(() => {
    const selected = modeOptions.find((item) => item.value === mode)!;
    return createConverter({ from: selected.from as never, to: selected.to as never });
  }, [mode]);

  const output = useMemo(() => converter(input), [converter, input]);

  return (
    <div className="space-y-3">
      <select
        value={mode}
        onChange={(event) => setMode(event.target.value as ConvertMode)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
      >
        {modeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm">输入文本</p>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[280px]"
          />
          <p className="text-xs text-slate-600 dark:text-slate-300">字符数: {input.length}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm">转换结果</p>
          <Textarea value={output} readOnly className="min-h-[280px]" />
          <p className="text-xs text-slate-600 dark:text-slate-300">字符数: {output.length}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(output);
            showToast("已复制转换结果");
          }}
        >
          复制结果
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setInput("");
          }}
        >
          清空
        </Button>
      </div>
    </div>
  );
}
