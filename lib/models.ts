export interface ModelOption {
  label: string;
  value: string;
  description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    label: "GPT-4o",
    value: "openai/gpt-4o",
    description: "通用科研写作与多轮对话，稳定均衡",
  },
  {
    label: "GPT-4o Mini",
    value: "openai/gpt-4o-mini",
    description: "轻量高速，适合草稿生成与快速改写",
  },
  {
    label: "GPT-4.1",
    value: "openai/gpt-4.1",
    description: "复杂指令遵循和长文重构能力强",
  },
  {
    label: "GPT-4.1 Mini",
    value: "openai/gpt-4.1-mini",
    description: "成本更低，适合日常批量写作任务",
  },
  {
    label: "o3-mini",
    value: "openai/o3-mini",
    description: "推理与严谨性较好，适合论证链条梳理",
  },
  {
    label: "Claude 3.7 Sonnet",
    value: "anthropic/claude-3.7-sonnet",
    description: "长文逻辑组织强，适合论文段落打磨",
  },
  {
    label: "Claude 3.5 Sonnet",
    value: "anthropic/claude-3.5-sonnet",
    description: "语气自然，适合引言/讨论等学术叙述",
  },
  {
    label: "Claude 3 Haiku",
    value: "anthropic/claude-3-haiku",
    description: "响应快，适合摘要初稿和轻编辑",
  },
  {
    label: "Gemini 1.5 Pro",
    value: "google/gemini-1.5-pro",
    description: "长上下文整合能力较好，适合材料归纳",
  },
  {
    label: "Gemini 1.5 Flash",
    value: "google/gemini-1.5-flash",
    description: "速度快，适合高频迭代和头脑风暴",
  },
  {
    label: "Gemini 2.0 Flash",
    value: "google/gemini-2.0-flash-001",
    description: "快速生成能力强，适合分段草稿",
  },
  {
    label: "DeepSeek Chat",
    value: "deepseek/deepseek-chat",
    description: "中文学术写作性价比高，表达流畅",
  },
  {
    label: "DeepSeek Reasoner",
    value: "deepseek/deepseek-reasoner",
    description: "推理过程更强，适合机制讨论与比较论证",
  },
  {
    label: "Qwen 2.5 72B",
    value: "qwen/qwen-2.5-72b-instruct",
    description: "中文语义与逻辑表现稳定",
  },
  {
    label: "QwQ 32B",
    value: "qwen/qwq-32b",
    description: "推理能力突出，适合复杂问题拆解",
  },
  {
    label: "Llama 3.3 70B",
    value: "meta-llama/llama-3.3-70b-instruct",
    description: "英文写作表现稳健，适合通用生成",
  },
  {
    label: "Mistral Large",
    value: "mistralai/mistral-large",
    description: "逻辑与可读性均衡，适合段落重写",
  },
  {
    label: "Mixtral 8x22B",
    value: "mistralai/mixtral-8x22b-instruct",
    description: "多主题生成稳定，适合对比性写作",
  },
  {
    label: "Grok 2",
    value: "x-ai/grok-2",
    description: "思路发散能力较好，适合早期构思",
  },
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0].value;

const modelMap = new Map(MODEL_OPTIONS.map((model) => [model.value, model]));

export function getModelOption(modelId: string) {
  return modelMap.get(modelId);
}

export function getModelDescription(modelId: string) {
  return getModelOption(modelId)?.description ?? "自定义模型（由 OpenRouter 路由），可用于任意支持的模型 ID。";
}

export function getModelOptionLabel(model: ModelOption) {
  return `${model.label} - ${model.description}`;
}
