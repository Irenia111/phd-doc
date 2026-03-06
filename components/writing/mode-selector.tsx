import { WritingMode } from "@/types";

const modes: Array<{ value: WritingMode; label: string }> = [
  { value: "discussion", label: "Discussion" },
  { value: "introduction", label: "Introduction" },
  { value: "abstract", label: "Abstract" },
  { value: "conclusion", label: "Conclusion" },
  { value: "free", label: "自由撰写" },
];

interface ModeSelectorProps {
  value: WritingMode;
  onChange: (mode: WritingMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid gap-2 md:grid-cols-5">
      {modes.map((mode) => (
        <button
          type="button"
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`rounded-md border px-3 py-2 text-sm ${
            value === mode.value
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 dark:border-slate-700"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
