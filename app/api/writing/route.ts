import { createProvider } from "@/lib/ai";
import { WRITING_PROMPT } from "@/lib/prompts";
import { streamText } from "ai";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    apiKey: string;
    model: string;
    mode: string;
    inputSummary: string;
    existingDraft?: string;
    references: string;
    requirements: string;
    outputLanguage: string;
    targetSections?: string[];
  };

  if (!body.apiKey) {
    return new Response("Missing API key", { status: 400 });
  }

  const provider = createProvider(body.apiKey);
  const result = streamText({
    model: provider(body.model),
    system: WRITING_PROMPT,
    prompt: `章节模式: ${body.mode}
输出语言: ${body.outputLanguage}
目标板块: ${(body.targetSections ?? []).join("、") || "按模式自动"}

研究摘要:
${body.inputSummary}

用户已有内容（可为空）:
${body.existingDraft ?? ""}

参考文献要点:
${body.references}

写作要求:
${body.requirements}`,
  });

  return result.toTextStreamResponse();
}
